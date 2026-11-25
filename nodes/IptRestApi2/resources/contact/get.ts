import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation. A contact is a contact person of an address.
export const contactInfo: ResourceInfo = {
	resource: 'contact',
	path: '/contacts',
	label: 'contact',
	labelPlural: 'contacts',
	idParameter: 'contactId',
	idDisplayName: 'Contact ID',
	idField: 'ContactID',
};

// Additional data the contacts endpoint can load. Get and Get Many offer the same list.
export const contactIncludes: INodePropertyOptions[] = [
	{ name: 'Attributes', value: 'attributes' },
	{ name: 'History', value: 'history' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list.
export const contactSimplifiedFields = [
	'ContactID',
	'AddressID',
	'ContactNumber',
	'Matchcode',
	'FirstName',
	'LastName',
	'EMail',
	'PhoneNr',
	'MobilePhone',
	'InActive',
];

export const contactGetDescription: INodeProperties[] = getProperties(
	contactInfo,
	contactSimplifiedFields,
	contactIncludes,
);
