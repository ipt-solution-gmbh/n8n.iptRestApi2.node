import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Product types, the field ProductType of products, for example a stock product or a service
export const productTypeInfo: ResourceInfo = {
	resource: 'productType',
	path: '/producttypes',
	label: 'product type',
	labelPlural: 'product types',
	idParameter: 'productTypeId',
	idDisplayName: 'Product Type ID',
	idField: 'ProductTypeID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const productTypeSimplifiedFields = [
	'ProductTypeID',
	'ProductTypeDesc',
	'IsSales',
	'IsPurchase',
	'IsStock',
	'IsCombination',
	'IsResourceList',
	'IsService',
	'Edition',
];

// Product types are defined by myfactory, so the node only reads them
export const productTypeDescription: INodeProperties[] = [
	operationProperty(productTypeInfo, {}, [], ['get', 'getAll']),
	...getProperties(productTypeInfo, productTypeSimplifiedFields, []),
	...getManyProperties(productTypeInfo, productTypeSimplifiedFields, [], {
		fields: 'ProductTypeID,ProductTypeDesc',
		sort: 'ProductTypeID',
		filterField: 'IsStock',
		clause: 'IsService$NE$0',
	}),
];
