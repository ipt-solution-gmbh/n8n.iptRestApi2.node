import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const salesOrderInfo: ResourceInfo = {
	resource: 'salesOrder',
	path: '/salesorders',
	label: 'sales order',
	labelPlural: 'sales orders',
	idParameter: 'salesOrderId',
	idDisplayName: 'Sales Order ID',
	idField: 'OrderID',
};

// A single sales order always comes with its positions, taxes and payments, so Get offers
// only the data the API does not load by itself
const salesOrderGetIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Lists load positions, taxes and payments only on request
export const salesOrderGetManyIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
	{ name: 'Payments', value: 'payments' },
	{ name: 'Positions', value: 'positions' },
	{ name: 'Taxes', value: 'taxes' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list. The positions are
// not part of it.
export const salesOrderSimplifiedFields = [
	'OrderID',
	'OrderNumber',
	'OrderType',
	'OrderTypeDesc',
	'BookingDate',
	'CustomerID',
	'CustomerNumber',
	'Name1',
	'OrderSum',
	'CurrUnit',
];

export const salesOrderGetDescription: INodeProperties[] = getProperties(
	salesOrderInfo,
	salesOrderSimplifiedFields,
	salesOrderGetIncludes,
);
