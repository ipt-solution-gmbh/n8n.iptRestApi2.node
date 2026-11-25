import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Contact groups, the field ContactGroup of contacts. The key is a text.
export const contactGroupInfo: ResourceInfo = {
	resource: 'contactGroup',
	path: '/contactgroups',
	label: 'contact group',
	labelPlural: 'contact groups',
	idParameter: 'contactGroupName',
	idDisplayName: 'Contact Group Name',
	idField: 'ContactGroupName',
	textKeyExample: 'SALES',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const contactGroupSimplifiedFields = ['ContactGroupName', 'ContactGroupDesc'];

// The endpoint is read-only, contact groups are maintained in myfactory
export const contactGroupDescription: INodeProperties[] = [
	operationProperty(contactGroupInfo, {}, [], ['get', 'getAll']),
	...getProperties(contactGroupInfo, contactGroupSimplifiedFields, []),
	...getManyProperties(contactGroupInfo, contactGroupSimplifiedFields, [], {
		fields: 'ContactGroupName,ContactGroupDesc',
		sort: 'ContactGroupName',
		filterField: 'ContactGroupDesc',
		clause: "ContactGroupDesc LIKE '$P100$sales$P100$'",
	}),
];
