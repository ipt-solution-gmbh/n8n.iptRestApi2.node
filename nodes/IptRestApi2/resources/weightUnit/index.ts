import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Units of the weight of products. The key is a text.
export const weightUnitInfo: ResourceInfo = {
	resource: 'weightUnit',
	path: '/weightunits',
	label: 'weight unit',
	labelPlural: 'weight units',
	idParameter: 'weightUnitName',
	idDisplayName: 'Weight Unit Name',
	idField: 'UnitName',
	textKeyExample: 'kg',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const weightUnitSimplifiedFields = ['UnitName', 'UnitDesc', 'UnitConversion', 'UnitCoefficient'];

export const weightUnitDescription: INodeProperties[] = [
	operationProperty(weightUnitInfo),
	...createDataProperty(
		'weightUnit',
		'Fields of the new weight unit as a JSON object. UnitName (the key, up to 10 characters) and UnitDesc are required.',
		'{"UnitName": "lb", "UnitDesc": "Pound"}',
	),
	...deleteProperties(
		weightUnitInfo,
		'Deleting a weight unit is permanent. myfactory refuses the delete while products use the weight unit. The node then fails with the reason (status 409).',
	),
	...getProperties(weightUnitInfo, weightUnitSimplifiedFields, []),
	...getManyProperties(weightUnitInfo, weightUnitSimplifiedFields, [], {
		fields: 'UnitName,UnitConversion',
		sort: 'UnitName',
		filterField: 'UnitDesc',
		clause: "UnitName LIKE 'k$P100$'",
	}),
	...updateDataProperty('weightUnit', '{"UnitDesc": "Pound"}', textKeyUpdateNote(weightUnitInfo)),
];
