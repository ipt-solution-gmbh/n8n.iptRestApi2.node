import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Payment conditions, for example the field PaymentConditions of customers and suppliers
export const paymentConditionInfo: ResourceInfo = {
	resource: 'paymentCondition',
	path: '/paymentconditions',
	label: 'payment condition',
	labelPlural: 'payment conditions',
	idParameter: 'paymentConditionId',
	idDisplayName: 'Payment Condition ID',
	idField: 'ConditionID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const paymentConditionSimplifiedFields = [
	'ConditionID',
	'ConditionDesc',
	'ConditionShortDesc',
	'CollectionType',
	'PaymentTarget',
];

export const paymentConditionDescription: INodeProperties[] = [
	operationProperty(paymentConditionInfo),
	...createDataProperty(
		'paymentCondition',
		'Fields of the new payment condition as a JSON object. CollectionType is required: the key of a collection type of your installation, listed in the table tdCollectionTypes (read it with Table Data). The API assigns ConditionID.',
		'{"CollectionType": "INVOICE", "ConditionDesc": "30 days net"}',
	),
	...deleteProperties(
		paymentConditionInfo,
		'Deleting a payment condition is permanent. myfactory refuses the delete while the payment condition is used, for example by customers, customer groups, suppliers or payments of documents. The node then fails with the reason (status 409).',
	),
	...getProperties(paymentConditionInfo, paymentConditionSimplifiedFields, []),
	...getManyProperties(paymentConditionInfo, paymentConditionSimplifiedFields, [], {
		fields: 'ConditionID,ConditionDesc,PaymentTarget',
		sort: 'ConditionID',
		filterField: 'CollectionType',
		clause: 'PaymentTarget$GT$14',
	}),
	...updateDataProperty('paymentCondition', '{"ConditionDesc": "14 days net"}'),
];
