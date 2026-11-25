import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Units of quantity of products and document positions. The key is a text.
export const unitInfo: ResourceInfo = {
	resource: 'unit',
	path: '/units',
	label: 'unit',
	labelPlural: 'units',
	idParameter: 'unitName',
	idDisplayName: 'Unit Name',
	idField: 'UnitName',
	textKeyExample: 'pcs',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const unitSimplifiedFields = ['UnitName', 'UnitDesc', 'UnitCode'];

export const unitDescription: INodeProperties[] = [
	operationProperty(unitInfo),
	...createDataProperty(
		'unit',
		'Fields of the new unit as a JSON object. UnitName (the key, up to 10 characters) and UnitDesc are required.',
		'{"UnitName": "box", "UnitDesc": "Box"}',
	),
	...deleteProperties(
		unitInfo,
		'Deleting a unit is permanent. myfactory refuses the delete while the unit is used, for example by products, bills of materials, document positions or stock entries. The node then fails with the reason (status 409).',
	),
	...getProperties(unitInfo, unitSimplifiedFields, []),
	...getManyProperties(unitInfo, unitSimplifiedFields, [], {
		fields: 'UnitName,UnitDesc',
		sort: 'UnitName',
		filterField: 'UnitCode',
		clause: "UnitDesc LIKE '$P100$box$P100$'",
	}),
	...updateDataProperty('unit', '{"UnitDesc": "Box of 10"}', textKeyUpdateNote(unitInfo)),
];
