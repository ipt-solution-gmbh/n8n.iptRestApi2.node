import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Manufacturers, the field ManufacturerID of products
export const manufacturerInfo: ResourceInfo = {
	resource: 'manufacturer',
	path: '/manufacturers',
	label: 'manufacturer',
	labelPlural: 'manufacturers',
	idParameter: 'manufacturerId',
	idDisplayName: 'Manufacturer ID',
	idField: 'ManufacturerID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const manufacturerSimplifiedFields = [
	'ManufacturerID',
	'ManufacturerName',
	'ManufacturerKey',
	'InActive',
];

export const manufacturerDescription: INodeProperties[] = [
	operationProperty(manufacturerInfo),
	...createDataProperty(
		'manufacturer',
		'Fields of the new manufacturer as a JSON object. ManufacturerName is required. The API assigns ManufacturerID.',
		'{"ManufacturerName": "Sample Tools Inc."}',
	),
	...deleteProperties(
		manufacturerInfo,
		'Deleting a manufacturer is permanent. myfactory refuses the delete while the manufacturer is assigned to products. The node then fails with the reason (status 409).',
	),
	...getProperties(manufacturerInfo, manufacturerSimplifiedFields, []),
	...getManyProperties(manufacturerInfo, manufacturerSimplifiedFields, [], {
		fields: 'ManufacturerID,ManufacturerName',
		sort: 'ManufacturerName',
		filterField: 'ManufacturerKey',
		clause: "ManufacturerName LIKE '$P100$tools$P100$'",
	}),
	...updateDataProperty('manufacturer', '{"Homepage": "https://example.com"}'),
];
