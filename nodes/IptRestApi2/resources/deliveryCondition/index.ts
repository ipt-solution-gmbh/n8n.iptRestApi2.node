import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Delivery conditions (terms of delivery), for example the field DeliveryCondition of customers.
// The key is a text.
export const deliveryConditionInfo: ResourceInfo = {
	resource: 'deliveryCondition',
	path: '/deliveryconditions',
	label: 'delivery condition',
	labelPlural: 'delivery conditions',
	idParameter: 'deliveryConditionName',
	idDisplayName: 'Delivery Condition Name',
	idField: 'DeliveryCondName',
	textKeyExample: 'EXW',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const deliveryConditionSimplifiedFields = ['DeliveryCondName', 'DeliveryCondDesc', 'InActive'];

export const deliveryConditionDescription: INodeProperties[] = [
	operationProperty(deliveryConditionInfo),
	...createDataProperty(
		'deliveryCondition',
		'Fields of the new delivery condition as a JSON object. DeliveryCondName (the key, up to 10 characters) and DeliveryCondDesc are required.',
		'{"DeliveryCondName": "EXW", "DeliveryCondDesc": "Ex works"}',
	),
	...deleteProperties(
		deliveryConditionInfo,
		'Deleting a delivery condition is permanent. myfactory refuses the delete while customers or suppliers use the delivery condition. The node then fails with the reason (status 409).',
	),
	...getProperties(deliveryConditionInfo, deliveryConditionSimplifiedFields, []),
	...getManyProperties(deliveryConditionInfo, deliveryConditionSimplifiedFields, [], {
		fields: 'DeliveryCondName,DeliveryCondDesc',
		sort: 'DeliveryCondName',
		filterField: 'InActive',
		clause: "DeliveryCondDesc LIKE '$P100$works$P100$'",
	}),
	...updateDataProperty(
		'deliveryCondition',
		'{"DeliveryCondDesc": "Ex works, loaded"}',
		textKeyUpdateNote(deliveryConditionInfo),
	),
];
