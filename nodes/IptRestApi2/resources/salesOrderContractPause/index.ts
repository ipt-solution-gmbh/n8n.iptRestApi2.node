import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Pauses of a contract. Generate Orders of the API takes them into account only with usePauses.
export const salesOrderContractPauseInfo: ResourceInfo = {
	resource: 'salesOrderContractPause',
	path: '/salesordercontractpauses',
	label: 'sales order contract pause',
	labelPlural: 'sales order contract pauses',
	idParameter: 'salesOrderContractPauseId',
	idDisplayName: 'Sales Order Contract Pause ID',
	idField: 'PauseID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. Every field of a pause
// is a base field.
const salesOrderContractPauseSimplifiedFields = ['PauseID', 'ContractID', 'DateFrom', 'DateTo'];

export const salesOrderContractPauseDescription: INodeProperties[] = [
	operationProperty(salesOrderContractPauseInfo, {
		createDescription: 'Add a pause to a contract',
	}),
	{
		displayName:
			'Sales Order Contract > Generate Orders takes pauses into account only with Use Pauses, which needs ipt RestApi2 58.5.0 or later. Without it, and on older versions, it also creates orders for paused periods.',
		name: 'salesOrderContractPauseCreateNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['salesOrderContractPause'],
				operation: ['create'],
			},
		},
		default: '',
	},
	...createDataProperty(
		'salesOrderContractPause',
		'Fields of the new pause as a JSON object. ContractID (the contract) and DateTo are required. Send DateFrom too, the first day of the pause.',
		'{"ContractID": 1234, "DateFrom": "2027-07-01", "DateTo": "2027-08-31"}',
	),
	...deleteProperties(salesOrderContractPauseInfo, 'Deleting a pause is permanent.'),
	...getProperties(salesOrderContractPauseInfo, salesOrderContractPauseSimplifiedFields, []),
	...getManyProperties(salesOrderContractPauseInfo, salesOrderContractPauseSimplifiedFields, [], {
		fields: 'PauseID,ContractID,DateFrom,DateTo',
		sort: 'ContractID,DateFrom',
		filterField: 'ContractID',
		clause: "DateTo$GT$$EQ$'20270101'",
	}),
	...updateDataProperty('salesOrderContractPause', '{"DateTo": "2027-09-30"}'),
];
