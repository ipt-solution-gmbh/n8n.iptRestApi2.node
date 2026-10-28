import type { INodeProperties } from 'n8n-workflow';
import { baseItemsOutput } from '../../shared/response';
import { productCreateDescription } from './create';
import { productGetDescription } from './get';
import { productGetManyDescription } from './getAll';
import { productUpdateDescription } from './update';

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
		// Rule for every resource: the action names myfactory ("<Verb> ... in/from myfactory").
		// n8n builds the default tool description for AI agents from it as "<action> in <node name>".
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a product in myfactory',
				description: 'Create a new product',
				routing: {
					request: {
						method: 'POST',
						url: '/products',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: baseItemsOutput,
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product from myfactory',
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
				action: 'Get many products from myfactory',
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
			{
				name: 'Update',
				value: 'update',
				action: 'Update a product in myfactory',
				description: 'Change the given fields of a product',
				routing: {
					request: {
						method: 'PUT',
						url: '=/products/{{encodeURIComponent($parameter.productId)}}',
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
	...productCreateDescription,
	...productGetDescription,
	...productGetManyDescription,
	...productUpdateDescription,
];
