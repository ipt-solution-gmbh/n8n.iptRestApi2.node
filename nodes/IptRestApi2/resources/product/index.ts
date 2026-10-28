import type { INodeProperties } from 'n8n-workflow';
import { baseItemsOutput } from '../../shared/response';
import { productGetDescription } from './get';
import { productGetManyDescription } from './getAll';

const showOnlyForProducts = {
	resource: ['product'],
};

export const productDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProducts,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product',
				description: 'Get the data of a single product',
				routing: {
					request: {
						method: 'GET',
						url: '=/products/{{encodeURIComponent($parameter.productId)}}',
						// Set per operation, so only operations that check the response with throwOnApiError accept error statuses
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: baseItemsOutput,
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many products',
				description: 'Get many products',
				routing: {
					request: {
						method: 'GET',
						url: '/products',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: baseItemsOutput,
					},
				},
			},
		],
		default: 'getAll',
	},
	...productGetDescription,
	...productGetManyDescription,
];
