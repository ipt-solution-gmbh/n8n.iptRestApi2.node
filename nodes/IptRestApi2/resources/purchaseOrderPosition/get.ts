import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const purchaseOrderPositionInfo: ResourceInfo = {
	resource: 'purchaseOrderPosition',
	path: '/purchaseorderpositions',
	label: 'purchase order position',
	labelPlural: 'purchase order positions',
	idParameter: 'purchaseOrderPosId',
	idDisplayName: 'Purchase Order Position ID',
	idField: 'OrderPosID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
export const purchaseOrderPositionSimplifiedFields = [
	'OrderPosID',
	'OrderID',
	'PosNumber',
	'ProductNumber',
	'Name1',
	'Quantity',
	'Unit',
	'Price',
	'Turnover',
	'DeliveryDate',
];

// Additional data the positions endpoint loads. Get and Get Many offer the same list.
export const purchaseOrderPositionIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

export const purchaseOrderPositionGetDescription: INodeProperties[] = getProperties(
	purchaseOrderPositionInfo,
	purchaseOrderPositionSimplifiedFields,
	purchaseOrderPositionIncludes,
);
