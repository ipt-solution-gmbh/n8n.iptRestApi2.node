import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProductGetMany = {
	operation: ['getAll'],
	resource: ['product'],
};

export const productGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForProductGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
				// 1000 is the largest page the API allows. Limit comes later in this list and
				// overrides the page size when Return All is off.
				type: 'query',
				property: 'pagesize',
				value: '1000',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response.body.Result.PageNumber < $response.body.Result.TotalPages }}',
						// Evaluated before every request. Before the first one $response is empty, so the
						// first page is 1. The page goes into the URL because a qs object here would
						// replace the query parameters (pagesize, fields, sort) instead of adding to them.
						request: {
							url: '={{ $request.url }}?page={{ $response.body ? $response.body.Result.PageNumber + 1 : 1 }}',
						},
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForProductGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'pagesize',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: showOnlyForProductGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				placeholder: 'ProductID,ProductNumber,Matchcode',
				description: 'Comma-separated list of fields to return. Leave empty for all fields.',
				routing: {
					send: {
						type: 'query',
						property: 'fields',
					},
				},
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '',
				placeholder: '-ChangeDate,Matchcode',
				description:
					'Comma-separated list of fields to sort by. A leading minus sorts in descending order.',
				routing: {
					send: {
						type: 'query',
						property: 'sort',
					},
				},
			},
		],
	},
];
