import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const addressInfo: ResourceInfo = {
	resource: 'address',
	path: '/addresses',
	label: 'address',
	labelPlural: 'addresses',
	idParameter: 'addressId',
	idDisplayName: 'Address ID',
	idField: 'AddressID',
};

// Additional data the addresses endpoint can load. Get and Get Many offer the same list.
export const addressIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list.
export const addressSimplifiedFields = [
	'AddressID',
	'AddressNumber',
	'Matchcode',
	'Name1',
	'Street',
	'PostalCode',
	'City',
	'Country',
	'EMail',
	'PhoneNr',
];

export const addressGetDescription: INodeProperties[] = getProperties(
	addressInfo,
	addressSimplifiedFields,
	addressIncludes,
);
