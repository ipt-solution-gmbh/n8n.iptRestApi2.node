import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// The error log of myfactory, read-only. The API returns only the entries of the database the
// credential signs in to.
export const errorLogInfo: ResourceInfo = {
	resource: 'errorLog',
	path: '/errorlogs',
	label: 'error log entry',
	labelPlural: 'error log entries',
	idParameter: 'errorLogId',
	idDisplayName: 'Error Log ID',
	idField: 'LogID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. DatabaseName is left
// out because it is always the database of the credential, CallStack because it is long.
const errorLogSimplifiedFields = ['LogID', 'LogDate', 'UserName', 'MessageText'];

// A $fromAI expression the AI agent left without a value resolves to undefined, which counts as
// not set like an empty text
function optionValue(context: IExecuteSingleFunctions, name: string): string {
	const value = context.getNodeParameter(`options.${name}`, '');
	return value === undefined || value === null ? '' : String(value).trim();
}

// The three options are query parameters of their own. n8n runs the preSend of an option only when
// the option is set, so each of them runs this function, and it always sends all of them.
// logid[gt] is exclusive, and sorting by LogID makes the pages follow the log in order, so the
// largest LogID of a run is the value for the next one. It replaces Sort of Options.
async function sendLogFilters(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const qs = { ...requestOptions.qs };
	const from = optionValue(this, 'logDateFrom');
	if (from !== '') {
		qs.logdatefrom = from;
	}
	const to = optionValue(this, 'logDateTo');
	if (to !== '') {
		qs.logdateto = to;
	}
	const logIdGreaterThan = optionValue(this, 'logIdGreaterThan');
	if (logIdGreaterThan !== '') {
		qs['LogID[gt]'] = logIdGreaterThan;
		qs.sort = 'LogID';
	}
	requestOptions.qs = qs;
	return requestOptions;
}

function logDateOption(displayName: string, name: string, description: string): INodeProperties {
	return {
		displayName,
		name,
		type: 'dateTime',
		default: '',
		description,
		routing: {
			send: {
				preSend: [sendLogFilters],
			},
		},
	};
}

export const errorLogDescription: INodeProperties[] = [
	operationProperty(
		errorLogInfo,
		{ getDescription: 'Get a single error log entry with its call stack' },
		[],
		['get', 'getAll'],
	),
	{
		displayName:
			'The entries come from the table tsErrorLog in the global myfactory database (wfGlobal), not from the client database. Only the entries of the database of the credential are returned. If rights are set for the access point, the API key needs the read right ErrorLogs. Anonymized API keys get no access.',
		name: 'errorLogNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['errorLog'],
			},
		},
		default: '',
	},
	...getProperties(errorLogInfo, errorLogSimplifiedFields, []),
	...getManyProperties(
		errorLogInfo,
		errorLogSimplifiedFields,
		[],
		{
			fields: 'LogID,LogDate,MessageText',
			sort: '-LogID',
			filterField: 'UserName',
			clause: "MessageText LIKE '$P100$timeout$P100$'",
		},
		[
			logDateOption(
				'Log Date From',
				'logDateFrom',
				'Return only entries logged at or after this time (field LogDate). A time without offset counts as the local time of the myfactory server.',
			),
			logDateOption(
				'Log Date To',
				'logDateTo',
				'Return only entries logged at or before this time (field LogDate). A date without a time means the start of that day. A time without offset counts as the local time of the myfactory server.',
			),
			{
				displayName: 'Log ID Greater Than',
				name: 'logIdGreaterThan',
				type: 'number',
				default: 0,
				description:
					'Return only entries with a larger LogID, sorted by LogID, to read new entries since the last run. Use the largest LogID of the last run, or 0 for the first run. Sort is then ignored.',
				routing: {
					send: {
						preSend: [sendLogFilters],
					},
				},
			},
		],
	),
];
