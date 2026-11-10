import type { INodeProperties } from 'n8n-workflow';
import { baseItemsOutput } from '../../shared/response';
import { tableDataGetManyDescription } from './getAll';

// The endpoint is read-only and has no single record route, so Get Many is the only operation
export const tableDataDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tableData'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many table rows from myfactory',
				description: 'Get the rows of a table or view',
				routing: {
					request: { method: 'GET', url: '/tabledatas', ignoreHttpStatusErrors: true },
					output: {
						postReceive: [
							...baseItemsOutput,
							// Each record holds its columns under Data, so the columns become the item
							{
								type: 'rootProperty',
								properties: {
									property: 'Data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	...tableDataGetManyDescription,
];
