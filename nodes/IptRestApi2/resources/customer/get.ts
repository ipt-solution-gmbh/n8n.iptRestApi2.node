import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const customerInfo: ResourceInfo = {
	resource: 'customer',
	path: '/customers',
	label: 'customer',
	labelPlural: 'customers',
	idParameter: 'customerId',
	idDisplayName: 'Customer ID',
	idField: 'CustomerID',
};

// Additional data the customers endpoint can load. Get and Get Many offer the same list.
export const customerIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list. Name and postal
// address belong to the address of the customer (AddressID).
export const customerSimplifiedFields = [
	'CustomerID',
	'CustomerNumber',
	'AddressID',
	'MatchcodeAdd',
	'CustomerGroup',
	'CurrencyUnit',
	'PaymentConditions',
	'IsFreezed',
	'InActive',
	'ChangeDate',
];

export const customerGetDescription: INodeProperties[] = getProperties(
	customerInfo,
	customerSimplifiedFields,
	customerIncludes,
);
