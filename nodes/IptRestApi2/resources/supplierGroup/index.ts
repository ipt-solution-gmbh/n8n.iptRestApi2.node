import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Supplier groups, the field SupplierGroup of suppliers. The key is a text.
export const supplierGroupInfo: ResourceInfo = {
	resource: 'supplierGroup',
	path: '/suppliergroups',
	label: 'supplier group',
	labelPlural: 'supplier groups',
	idParameter: 'supplierGroupName',
	idDisplayName: 'Supplier Group Name',
	idField: 'SupplierGroupName',
	textKeyExample: 'PARTS',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const supplierGroupSimplifiedFields = [
	'SupplierGroupName',
	'SupplierGroupDesc',
	'SupplierGroupTree',
];

export const supplierGroupDescription: INodeProperties[] = [
	operationProperty(supplierGroupInfo),
	...createDataProperty(
		'supplierGroup',
		'Fields of the new supplier group as a JSON object. SupplierGroupName (the key, up to 10 characters) and SupplierGroupDesc are required.',
		'{"SupplierGroupName": "PARTS", "SupplierGroupDesc": "Parts suppliers"}',
	),
	...deleteProperties(
		supplierGroupInfo,
		'Deleting a supplier group is permanent. myfactory refuses the delete while suppliers belong to the group. The node then fails with the reason (status 409).',
	),
	...getProperties(supplierGroupInfo, supplierGroupSimplifiedFields, []),
	...getManyProperties(supplierGroupInfo, supplierGroupSimplifiedFields, [], {
		fields: 'SupplierGroupName,SupplierGroupDesc',
		sort: 'SupplierGroupName',
		filterField: 'SupplierGroupDesc',
		clause: "SupplierGroupDesc LIKE '$P100$parts$P100$'",
	}),
	...updateDataProperty(
		'supplierGroup',
		'{"SupplierGroupDesc": "Parts suppliers"}',
		textKeyUpdateNote(supplierGroupInfo),
	),
];
