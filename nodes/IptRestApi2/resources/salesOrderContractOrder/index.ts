import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// The order plan of a contract: each entry names an order type and the term after which
// Generate Orders creates the next order of that type
export const salesOrderContractOrderInfo: ResourceInfo = {
	resource: 'salesOrderContractOrder',
	path: '/salesordercontractorders',
	label: 'sales order contract order',
	labelPlural: 'sales order contract orders',
	idParameter: 'salesOrderContractOrderId',
	idDisplayName: 'Sales Order Contract Order ID',
	idField: 'ContractOrderID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. Every field of an
// entry is a base field.
const salesOrderContractOrderSimplifiedFields = [
	'ContractOrderID',
	'ContractID',
	'OrderType',
	'ContractTermID',
	'PrintQuantity',
	'BatchPrint',
	'DueDateFirst',
];

export const salesOrderContractOrderDescription: INodeProperties[] = [
	operationProperty(salesOrderContractOrderInfo, {
		createDescription: 'Add an entry to the order plan of a contract',
	}),
	...createDataProperty(
		'salesOrderContractOrder',
		'Fields of the new order plan entry as a JSON object. Required are ContractID (the contract), OrderType (the number of the order type Generate Orders creates, for example of an invoice) and ContractTermID (a Sales Order Contract Term, the period between two orders).',
		'{"ContractID": 1234, "OrderType": 1, "ContractTermID": 1}',
	),
	...deleteProperties(
		salesOrderContractOrderInfo,
		'Deleting an order plan entry is permanent. Generate Orders then creates no more orders of this entry for the contract. Orders created before are not changed.',
	),
	...getProperties(salesOrderContractOrderInfo, salesOrderContractOrderSimplifiedFields, []),
	...getManyProperties(salesOrderContractOrderInfo, salesOrderContractOrderSimplifiedFields, [], {
		fields: 'ContractOrderID,ContractID,OrderType',
		sort: 'ContractID,ContractOrderID',
		filterField: 'ContractID',
		clause: 'BatchPrint$NE$0',
	}),
	...updateDataProperty('salesOrderContractOrder', '{"ContractTermID": 2}'),
];
