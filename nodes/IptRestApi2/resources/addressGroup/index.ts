import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Address groups, the field AddressGroup of addresses. The key is a text.
export const addressGroupInfo: ResourceInfo = {
	resource: 'addressGroup',
	path: '/addressgroups',
	label: 'address group',
	labelPlural: 'address groups',
	idParameter: 'addressGroupName',
	idDisplayName: 'Address Group Name',
	idField: 'AddressGroupName',
	textKeyExample: 'PARTNER',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const addressGroupSimplifiedFields = ['AddressGroupName', 'AddressGroupDesc'];

// The endpoint is read-only, address groups are maintained in myfactory
export const addressGroupDescription: INodeProperties[] = [
	operationProperty(addressGroupInfo, {}, [], ['get', 'getAll']),
	...getProperties(addressGroupInfo, addressGroupSimplifiedFields, []),
	...getManyProperties(addressGroupInfo, addressGroupSimplifiedFields, [], {
		fields: 'AddressGroupName,AddressGroupDesc',
		sort: 'AddressGroupName',
		filterField: 'AddressGroupDesc',
		clause: "AddressGroupDesc LIKE '$P100$partner$P100$'",
	}),
];
