import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Shipment conditions (shipping methods), for example the field ShipmentCondition of customers.
// The key is a text.
export const shipmentConditionInfo: ResourceInfo = {
	resource: 'shipmentCondition',
	path: '/shipmentconditions',
	label: 'shipment condition',
	labelPlural: 'shipment conditions',
	idParameter: 'shipmentConditionName',
	idDisplayName: 'Shipment Condition Name',
	idField: 'ShipmentCondName',
	textKeyExample: 'COURIER',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const shipmentConditionSimplifiedFields = ['ShipmentCondName', 'ShipmentCondDesc', 'InActive'];

export const shipmentConditionDescription: INodeProperties[] = [
	operationProperty(shipmentConditionInfo),
	...createDataProperty(
		'shipmentCondition',
		'Fields of the new shipment condition as a JSON object. ShipmentCondName (the key, up to 10 characters) and ShipmentCondDesc are required.',
		'{"ShipmentCondName": "COURIER", "ShipmentCondDesc": "Courier"}',
	),
	...deleteProperties(
		shipmentConditionInfo,
		'Deleting a shipment condition is permanent and also removes its shipping prices and zones in myfactory. myfactory refuses the delete while customers or suppliers use the shipment condition. The node then fails with the reason (status 409).',
	),
	...getProperties(shipmentConditionInfo, shipmentConditionSimplifiedFields, []),
	...getManyProperties(shipmentConditionInfo, shipmentConditionSimplifiedFields, [], {
		fields: 'ShipmentCondName,ShipmentCondDesc',
		sort: 'ShipmentCondName',
		filterField: 'InActive',
		clause: "ShipmentCondDesc LIKE '$P100$express$P100$'",
	}),
	...updateDataProperty(
		'shipmentCondition',
		'{"ShipmentCondDesc": "Courier, next day"}',
		textKeyUpdateNote(shipmentConditionInfo),
	),
];
