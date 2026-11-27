import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// The result of Generate Orders per contract and run: the created order, or in ErrorText the
// reason why no order was created. The endpoint is read-only.
export const salesOrderContractResultInfo: ResourceInfo = {
	resource: 'salesOrderContractResult',
	path: '/salesordercontractresults',
	label: 'sales order contract result',
	labelPlural: 'sales order contract results',
	idParameter: 'salesOrderContractResultId',
	idDisplayName: 'Sales Order Contract Result ID',
	idField: 'ContractResultsID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. ErrorText is not a
// base field, so a list without Simplify, Fields or All Data leaves it out.
const salesOrderContractResultSimplifiedFields = [
	'ContractResultsID',
	'ContractBatchID',
	'ContractID',
	'OrderID',
	'StartDate',
	'EndDate',
	'ErrorText',
];

export const salesOrderContractResultDescription: INodeProperties[] = [
	operationProperty(
		salesOrderContractResultInfo,
		{ getDescription: 'Get the result of Generate Orders for one contract and run' },
		[],
		['get', 'getAll'],
	),
	...getProperties(salesOrderContractResultInfo, salesOrderContractResultSimplifiedFields, []),
	...getManyProperties(salesOrderContractResultInfo, salesOrderContractResultSimplifiedFields, [], {
		fields: 'ContractID,OrderID,ErrorText',
		sort: 'ContractID,StartDate',
		filterField: 'ContractBatchID',
		clause: 'OrderID$EQ$0',
	}),
];
