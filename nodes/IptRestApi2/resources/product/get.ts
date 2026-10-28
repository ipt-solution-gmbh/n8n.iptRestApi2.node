import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { includeOption, simplifyProperty } from '../../shared/read';

// Additional data the products endpoint can load. Get and Get Many offer the same list.
export const productIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
	{ name: 'Multiple EANs', value: 'multiean' },
	{ name: 'Variants', value: 'variants' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list.
export const productSimplifiedFields = [
	'ProductID',
	'ProductNumber',
	'Matchcode',
	'Name1',
	'ProductGroup',
	'BaseUnit',
	'EANNumber',
	'InActive',
	'ProductState',
	'ChangeDate',
];

export const productGetDescription: INodeProperties[] = [
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get', 'update'],
			},
		},
		default: '',
		placeholder: '1234',
		description: 'Numeric ID of the product (field ProductID)',
	},
	simplifyProperty('product', 'get', productSimplifiedFields),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get'],
			},
		},
		default: {},
		options: [includeOption(productIncludes)],
	},
];
