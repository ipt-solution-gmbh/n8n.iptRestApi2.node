import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Product groups, the field ProductGroup of products. The key is a text.
export const productGroupInfo: ResourceInfo = {
	resource: 'productGroup',
	path: '/productgroups',
	label: 'product group',
	labelPlural: 'product groups',
	idParameter: 'productGroupName',
	idDisplayName: 'Product Group Name',
	idField: 'ProductGroupName',
	textKeyExample: 'TOOLS',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const productGroupSimplifiedFields = [
	'ProductGroupName',
	'ProductGroupDesc',
	'ProductGroupTree',
	'PriceGroup',
	'InActive',
];

export const productGroupDescription: INodeProperties[] = [
	operationProperty(productGroupInfo),
	...createDataProperty(
		'productGroup',
		'Fields of the new product group as a JSON object. ProductGroupName (the key, up to 10 characters) and ProductGroupDesc are required.',
		'{"ProductGroupName": "TOOLS", "ProductGroupDesc": "Tools"}',
	),
	...deleteProperties(
		productGroupInfo,
		'Deleting a product group is permanent and also removes entries that belong to the group in myfactory, such as its translations. myfactory refuses the delete while the product group is used, for example by products, document positions, inventories or statistics. The node then fails with the reason (status 409).',
	),
	...getProperties(productGroupInfo, productGroupSimplifiedFields, []),
	...getManyProperties(productGroupInfo, productGroupSimplifiedFields, [], {
		fields: 'ProductGroupName,ProductGroupDesc',
		sort: 'ProductGroupName',
		filterField: 'InActive',
		clause: "ProductGroupDesc LIKE '$P100$tool$P100$'",
	}),
	...updateDataProperty(
		'productGroup',
		'{"ProductGroupDesc": "Hand tools"}',
		textKeyUpdateNote(productGroupInfo),
	),
];
