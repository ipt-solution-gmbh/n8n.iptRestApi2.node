import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const supplierInfo: ResourceInfo = {
	resource: 'supplier',
	path: '/suppliers',
	label: 'supplier',
	labelPlural: 'suppliers',
	idParameter: 'supplierId',
	idDisplayName: 'Supplier ID',
	idField: 'SupplierID',
};

// Additional data the suppliers endpoint can load. Get and Get Many offer the same list.
export const supplierIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list. Name and postal
// address belong to the address of the supplier (AddressID).
export const supplierSimplifiedFields = [
	'SupplierID',
	'SupplierNumber',
	'AddressID',
	'MatchcodeAdd',
	'SupplierGroup',
	'CurrencyUnit',
	'PaymentConditions',
	'IsFreezed',
	'InActive',
	'ChangeDate',
];

export const supplierGetDescription: INodeProperties[] = getProperties(
	supplierInfo,
	supplierSimplifiedFields,
	supplierIncludes,
);
