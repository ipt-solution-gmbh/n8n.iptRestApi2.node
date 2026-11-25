import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Customer groups, the field CustomerGroup of customers. The key is a text.
export const customerGroupInfo: ResourceInfo = {
	resource: 'customerGroup',
	path: '/customergroups',
	label: 'customer group',
	labelPlural: 'customer groups',
	idParameter: 'customerGroupName',
	idDisplayName: 'Customer Group Name',
	idField: 'CustomerGroupName',
	textKeyExample: 'RETAIL',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const customerGroupSimplifiedFields = ['CustomerGroupName', 'CustomerGroupDesc', 'InActive'];

export const customerGroupDescription: INodeProperties[] = [
	operationProperty(customerGroupInfo),
	...createDataProperty(
		'customerGroup',
		'Fields of the new customer group as a JSON object. CustomerGroupName (the key, up to 10 characters) and CustomerGroupDesc are required.',
		'{"CustomerGroupName": "RETAIL", "CustomerGroupDesc": "Retail customers"}',
	),
	...deleteProperties(
		customerGroupInfo,
		'Deleting a customer group is permanent and also removes entries that belong to the group in myfactory, such as its commission entries. myfactory refuses the delete while the customer group is used, for example by customers, sales documents, statistics or budgets. The node then fails with the reason (status 409).',
	),
	...getProperties(customerGroupInfo, customerGroupSimplifiedFields, []),
	...getManyProperties(customerGroupInfo, customerGroupSimplifiedFields, [], {
		fields: 'CustomerGroupName,CustomerGroupDesc',
		sort: 'CustomerGroupName',
		filterField: 'InActive',
		clause: "CustomerGroupDesc LIKE '$P100$retail$P100$'",
	}),
	...updateDataProperty(
		'customerGroup',
		'{"CustomerGroupDesc": "Retail customers"}',
		textKeyUpdateNote(customerGroupInfo),
	),
];
