import {
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
} from 'n8n-workflow';
import { bracketedClause, clauseOption, getManyProperties } from '../../shared/read';
import { supportMailInfo, supportMailSimplifiedFields } from './get';

function hasValue(value: unknown): boolean {
	return value !== undefined && value !== null && String(value).trim() !== '';
}

// A date of the n8n date picker or an ISO string as an SQL Server literal that does not depend on
// the language of the server. The time is taken as written, an offset is ignored, because
// myfactory stores the local time of the server. : is written as $2P$ like in a clause.
function dateTimeLiteral(context: IExecuteSingleFunctions, name: string, value: unknown): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(
		String(value).trim(),
	);
	if (!match) {
		throw new NodeOperationError(context.getNode(), `${name} is not a valid date`, {
			description: 'Write the date as 2026-11-01 or with a time as 2026-11-01T08:00:00',
		});
	}
	const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
	return `'${year}${month}${day} ${hour}$2P$${minute}$2P$${second}'`;
}

// Received Since and Received Before become part of the clause, so the clause of Options and the
// range go into one parameter. n8n runs the preSend of an option only when the option is set, so
// each of the three options runs this function, and it always builds the whole clause.
async function sendMailClause(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const conditions = [bracketedClause(this)];
	const since = this.getNodeParameter('options.receivedSince', '');
	if (hasValue(since)) {
		conditions.push(`ReceivedDate$GT$$EQ$${dateTimeLiteral(this, 'Received Since', since)}`);
	}
	const before = this.getNodeParameter('options.receivedBefore', '');
	if (hasValue(before)) {
		conditions.push(`ReceivedDate$LT$${dateTimeLiteral(this, 'Received Before', before)}`);
	}
	const clause = conditions.filter((condition) => condition !== '').join(' AND ');
	if (clause !== '') {
		requestOptions.qs = { ...requestOptions.qs, clause };
	}
	return requestOptions;
}

// The API loads the content as soon as the parameter is present, so it is only sent when on
async function sendContent(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	if (this.getNodeParameter('options.content', false) === true) {
		requestOptions.qs = { ...requestOptions.qs, content: 'true' };
	}
	return requestOptions;
}

// The case, position and address filters are query parameters of their own, not columns of the
// mail. An empty value is answered with status 400, so only filled ones are sent. The query name
// is the option name in lowercase. Like sendMailClause, this runs for every option that is set and
// always sends all of them.
const filterOptionNames = ['caseId', 'caseNumber', 'posId', 'from', 'to', 'cc', 'bcc', 'replyTo'];

async function sendMailFilters(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const qs = { ...requestOptions.qs };
	for (const name of filterOptionNames) {
		const value = this.getNodeParameter(`options.${name}`, '');
		if (hasValue(value)) {
			qs[name.toLowerCase()] = String(value).trim();
		}
	}
	requestOptions.qs = qs;
	return requestOptions;
}

function queryOption(
	displayName: string,
	name: string,
	placeholder: string,
	description: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		placeholder,
		description,
		routing: {
			send: {
				preSend: [sendMailFilters],
			},
		},
	};
}

function addressOption(displayName: string, name: string, role: string): INodeProperties {
	return queryOption(
		displayName,
		name,
		'name@example.com',
		`Return only mails with exactly this e-mail address ${role}`,
	);
}

function receivedOption(displayName: string, name: string, description: string): INodeProperties {
	return {
		displayName,
		name,
		type: 'dateTime',
		default: '',
		description,
		routing: {
			send: {
				preSend: [sendMailClause],
			},
		},
	};
}

export const supportMailGetManyDescription: INodeProperties[] = getManyProperties(
	supportMailInfo,
	supportMailSimplifiedFields,
	[],
	{
		fields: 'MailID,Subject,ReceivedDate,From',
		sort: '-ReceivedDate',
		filterField: 'Priority',
		clause: "Subject LIKE '$P100$invoice$P100$'",
	},
	[
		{
			...clauseOption(
				'SQL condition on the columns of the mail header, for example Subject or ReceivedDate, combined with the other options by AND. Case, position and addresses are not columns, use their own options.',
				'MailID$GT$5000',
				"Subject LIKE '$P100$invoice$P100$'",
			),
			routing: {
				send: {
					preSend: [sendMailClause],
				},
			},
		},
		{
			displayName: 'Include Content',
			name: 'content',
			type: 'boolean',
			default: false,
			description:
				'Whether to load the text and the attachment list of each mail (field Content). The API reads them from the document storage, about one second per 100 mails, so keep the Limit small. Get always returns the content.',
			routing: {
				send: {
					preSend: [sendContent],
				},
			},
		},
		receivedOption(
			'Received Before',
			'receivedBefore',
			'Return only mails received before this time (field ReceivedDate). Mails without a received date are left out. The time counts as the local time of the myfactory server, an offset is ignored.',
		),
		receivedOption(
			'Received Since',
			'receivedSince',
			'Return only mails received at or after this time (field ReceivedDate), for example the time of the last run. Mails without a received date are left out. The time counts as the local time of the myfactory server, an offset is ignored.',
		),
		queryOption(
			'Support Case ID',
			'caseId',
			'1234',
			'Return only the mails of the support case with this CaseID',
		),
		queryOption(
			'Support Case Number',
			'caseNumber',
			'SC-1001',
			'Return only the mails of the support case with this CaseNumber',
		),
		queryOption(
			'Support Case Position ID',
			'posId',
			'5678',
			'Return only the mails of the support case position with this PosID',
		),
		addressOption('From', 'from', 'as sender'),
		addressOption('To', 'to', 'as recipient'),
		addressOption('Cc', 'cc', 'in copy'),
		addressOption('Bcc', 'bcc', 'in blind copy'),
		addressOption('Reply To', 'replyTo', 'as reply address'),
	],
);
