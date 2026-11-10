import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const salesOrderPositionInfo: ResourceInfo = {
	resource: 'salesOrderPosition',
	path: '/salesorderpositions',
	label: 'sales order position',
	labelPlural: 'sales order positions',
	idParameter: 'salesOrderPosId',
	idDisplayName: 'Sales Order Position ID',
	idField: 'OrderPosID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
export const salesOrderPositionSimplifiedFields = [
	'OrderPosID',
	'OrderID',
	'PosNumber',
	'ProductID',
	'ProductNumber',
	'Name1',
	'Quantity',
	'Unit',
	'Price',
	'Turnover',
];

// Additional data the positions endpoint loads. Get and Get Many offer the same list. The API
// also lists variants and commissions for this endpoint, but loads them only with a whole sales
// order, so they would always be missing here.
export const salesOrderPositionIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

export const salesOrderPositionGetDescription: INodeProperties[] = getProperties(
	salesOrderPositionInfo,
	salesOrderPositionSimplifiedFields,
	salesOrderPositionIncludes,
);
