import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const purchaseOrderInfo: ResourceInfo = {
	resource: 'purchaseOrder',
	path: '/purchaseorders',
	label: 'purchase order',
	labelPlural: 'purchase orders',
	idParameter: 'purchaseOrderId',
	idDisplayName: 'Purchase Order ID',
	idField: 'OrderID',
};

// A single purchase order always comes with its positions, taxes and payments, so Get offers
// only the data the API does not load by itself
const purchaseOrderGetIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Lists load positions, taxes and payments only on request
export const purchaseOrderGetManyIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
	{ name: 'Payments', value: 'payments' },
	{ name: 'Positions', value: 'positions' },
	{ name: 'Taxes', value: 'taxes' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list. The positions are
// not part of it.
export const purchaseOrderSimplifiedFields = [
	'OrderID',
	'OrderNumber',
	'OrderType',
	'OrderTypeDesc',
	'BookingDate',
	'DeliveryDate',
	'SupplierNumber',
	'Name1',
	'OrderSum',
	'CurrUnit',
];

export const purchaseOrderGetDescription: INodeProperties[] = getProperties(
	purchaseOrderInfo,
	purchaseOrderSimplifiedFields,
	purchaseOrderGetIncludes,
);
