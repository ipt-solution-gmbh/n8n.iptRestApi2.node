import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Notice periods of contracts, the field CancelID of contracts
export const salesOrderContractCancellationInfo: ResourceInfo = {
	resource: 'salesOrderContractCancellation',
	path: '/salesordercontractcancellations',
	label: 'sales order contract cancellation',
	labelPlural: 'sales order contract cancellations',
	idParameter: 'salesOrderContractCancellationId',
	idDisplayName: 'Sales Order Contract Cancellation ID',
	idField: 'CancelID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. Every field of a
// notice period is a base field.
const salesOrderContractCancellationSimplifiedFields = [
	'CancelID',
	'CancelDesc',
	'CancelType',
	'CancelIntervalls',
	'CancelRangeTyp',
];

export const salesOrderContractCancellationDescription: INodeProperties[] = [
	operationProperty(salesOrderContractCancellationInfo),
	...createDataProperty(
		'salesOrderContractCancellation',
		'Fields of the new notice period as a JSON object. CancelDesc is required, the API assigns CancelID. CancelType, CancelIntervalls and CancelRangeTyp hold the period with the values of the notice period dialog in myfactory, without them they are 0.',
		'{"CancelDesc": "3 months to the end of the quarter"}',
	),
	...deleteProperties(
		salesOrderContractCancellationInfo,
		'Deleting a notice period is permanent. From ipt RestApi2 58.6.1 on, the API answers with status 409 while contracts still use it. Older versions do not check this and delete it anyway, those contracts then refer to a notice period that no longer exists. There, check with Sales Order Contract > Get Many and the filter CancelID first.',
	),
	...getProperties(
		salesOrderContractCancellationInfo,
		salesOrderContractCancellationSimplifiedFields,
		[],
	),
	...getManyProperties(
		salesOrderContractCancellationInfo,
		salesOrderContractCancellationSimplifiedFields,
		[],
		{
			fields: 'CancelID,CancelDesc',
			sort: 'CancelDesc',
			filterField: 'CancelType',
			clause: "CancelDesc LIKE '$P100$quarter$P100$'",
		},
	),
	...updateDataProperty(
		'salesOrderContractCancellation',
		'{"CancelDesc": "3 months to the end of the year"}',
	),
];
