import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { clauseOption, fieldsOption, paginationProperties } from '../../shared/read';

const showOnlyForGetMany = {
	resource: ['tableData'],
	operation: ['getAll'],
};

// The endpoint returns all columns without alldata, so only fields is sent. A $fromAI expression
// the AI agent left without a value resolves to undefined, which counts as empty like an empty text.
async function sendFields(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const fieldsValue = this.getNodeParameter('options.fields', '');
	const fields = typeof fieldsValue === 'string' ? fieldsValue.trim() : '';
	if (fields !== '') {
		requestOptions.qs = { ...requestOptions.qs, fields };
	}
	return requestOptions;
}

// The endpoint reads any table or view, so the API knows no column types and no model. Sort is
// checked against the model and fails for every column, and filters are not converted by column
// type. Only Clause and Fields work as on the other resources.
export const tableDataGetManyDescription: INodeProperties[] = [
	{
		displayName:
			'If rights are set for the access point, the API key needs the read right TableDatas. Under Options, use Clause to search and Fields to choose columns. The API cannot sort this list, so Return All over more than 1000 rows can skip or repeat rows. Narrow large tables with Clause so that the result fits on one page.',
		name: 'tableDataNotice',
		type: 'notice',
		displayOptions: {
			show: showOnlyForGetMany,
		},
		default: '',
	},
	{
		displayName: 'Table',
		name: 'table',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForGetMany,
		},
		default: '',
		placeholder: 'tdProducts',
		description:
			'Name of a table or view in the myfactory client database, without schema, for example tdProducts. The tables of the interface itself (tdIptRestApi2...) are not available.',
		routing: {
			send: {
				type: 'query',
				property: 'table',
			},
		},
	},
	...paginationProperties('tableData'),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		displayOptions: {
			show: showOnlyForGetMany,
		},
		default: {},
		options: [
			clauseOption(
				'SQL condition on the columns of the table or view.',
				// The tables differ, so the range example names no real column
				'&lt;key column&gt;',
				"ChangeDate$GT$$EQ$'20261001'",
			),
			{
				...fieldsOption('ProductID,ProductNumber,Matchcode'),
				routing: {
					send: {
						preSend: [sendFields],
					},
				},
			},
		],
	},
];
