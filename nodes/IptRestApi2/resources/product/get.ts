import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const productInfo: ResourceInfo = {
	resource: 'product',
	path: '/products',
	label: 'product',
	labelPlural: 'products',
	idParameter: 'productId',
	idDisplayName: 'Product ID',
	idField: 'ProductID',
};

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

export const productGetDescription: INodeProperties[] = getProperties(
	productInfo,
	productSimplifiedFields,
	productIncludes,
);
