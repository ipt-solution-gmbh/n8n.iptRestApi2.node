import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProductGet = {
	operation: ['get'],
	resource: ['product'],
};

export const productGetDescription: INodeProperties[] = [
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForProductGet },
		default: '',
		placeholder: '1234',
		description: 'Numeric ID of the product (field ProductID)',
	},
];
