import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// The runs of Generate Orders. The endpoint is read-only, each run of the action adds one.
export const salesOrderContractBatchInfo: ResourceInfo = {
	resource: 'salesOrderContractBatch',
	path: '/salesordercontractbatches',
	label: 'sales order contract batch',
	labelPlural: 'sales order contract batches',
	idParameter: 'salesOrderContractBatchId',
	idDisplayName: 'Sales Order Contract Batch ID',
	idField: 'ContractBatchID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. Every field of a run
// is a base field.
const salesOrderContractBatchSimplifiedFields = [
	'ContractBatchID',
	'BatchDesc',
	'UserName',
	'CreationDate',
	'DueDate',
	'DivisionNr',
];

export const salesOrderContractBatchDescription: INodeProperties[] = [
	operationProperty(
		salesOrderContractBatchInfo,
		{ getDescription: 'Get a single run of Generate Orders' },
		[],
		['get', 'getAll'],
	),
	...getProperties(salesOrderContractBatchInfo, salesOrderContractBatchSimplifiedFields, []),
	...getManyProperties(salesOrderContractBatchInfo, salesOrderContractBatchSimplifiedFields, [], {
		fields: 'ContractBatchID,CreationDate,DueDate',
		sort: '-ContractBatchID',
		filterField: 'DivisionNr',
		clause: "CreationDate$GT$$EQ$'20261101'",
	}),
];
