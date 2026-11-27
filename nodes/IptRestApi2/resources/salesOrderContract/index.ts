import {
	NodeOperationError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	type INodePropertyOptions,
} from 'n8n-workflow';
import { actionNotice, bodySwitch, showFor } from '../../shared/actions';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { changedSinceOption, getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { resultOutput } from '../../shared/response';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Contracts such as subscriptions or maintenance contracts. Generate Orders creates the sales
// orders that are due from them.
export const salesOrderContractInfo: ResourceInfo = {
	resource: 'salesOrderContract',
	path: '/salesordercontracts',
	label: 'sales order contract',
	labelPlural: 'sales order contracts',
	idParameter: 'salesOrderContractId',
	idDisplayName: 'Sales Order Contract ID',
	idField: 'ContractID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. They are also the
// base fields of a list.
const salesOrderContractSimplifiedFields = [
	'ContractID',
	'ContractDesc',
	'ContractNumber',
	'ContractTypeName',
	'CustomerID',
	'OrderID',
	'StartDate',
	'EndDate',
	'Active',
	'IsCanceled',
];

const resource = salesOrderContractInfo.resource;

// The action has no contract ID, it works on all active contracts of the given types
const generateOrdersOperation: INodePropertyOptions = {
	name: 'Generate Orders',
	value: 'generateOrders',
	action: 'Generate sales orders from contracts in myfactory',
	description: 'Create the sales orders that are due from the active contracts of the given types',
	routing: {
		request: {
			method: 'POST',
			url: `${salesOrderContractInfo.path}/generateorders`,
			// The API rejects a body that is not declared as JSON
			headers: { 'Content-Type': 'application/json' },
			ignoreHttpStatusErrors: true,
		},
		output: {
			postReceive: resultOutput,
		},
	},
};

// The API expects the contract types as an array of names. The node takes a comma-separated
// list, which is easier to fill from an expression or by an AI agent.
async function sendContractTypes(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const value = this.getNodeParameter('contractTypes', '');
	const contractTypes = (typeof value === 'string' ? value : '')
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name !== '');
	if (contractTypes.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Contract Types is empty', {
			description:
				'Enter one or more ContractTypeName values, separated by commas, for example SERVICE,RENTAL',
		});
	}
	requestOptions.body = { ...(requestOptions.body as IDataObject), contractTypes };
	return requestOptions;
}

// Without a date the API creates no orders and answers with status 409, so the node requires
// it. The date picker and expressions give an ISO date with time, the node sends the date part.
async function sendToDate(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const value = this.getNodeParameter('toDate', '');
	const match = /^\d{4}-\d{2}-\d{2}/.exec(
		value === undefined || value === null ? '' : String(value).trim(),
	);
	if (match === null) {
		throw new NodeOperationError(this.getNode(), 'To Date must be a date', {
			description: 'Enter the date as yyyy-MM-dd, for example 2026-12-31',
		});
	}
	requestOptions.body = { ...(requestOptions.body as IDataObject), toDate: match[0] };
	return requestOptions;
}

// A text filter of Generate Orders that goes into the request body
function filterText(
	displayName: string,
	name: string,
	placeholder: string,
	description: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		placeholder: `e.g. ${placeholder}`,
		description,
		routing: { send: { type: 'body', property: name } },
	};
}

const generateOrdersDescription: INodeProperties[] = [
	actionNotice(
		resource,
		'generateOrders',
		'Creates real sales orders in myfactory from every active contract (Active = -1) of the given contract types, for all periods up to To Date. Pauses of a contract are taken into account only with Use Pauses (ipt RestApi2 58.5.0 or later), otherwise orders are also created for paused periods. If no contract matches or no order is due, the API answers with status 409. The output holds batchId: read the run with Sales Order Contract Batch and the result per contract with Sales Order Contract Result (filter ContractBatchID), where ErrorText says why an order is missing.',
	),
	{
		displayName: 'Contract Types',
		name: 'contractTypes',
		type: 'string',
		required: true,
		displayOptions: showFor(resource, 'generateOrders'),
		default: '',
		placeholder: 'e.g. SERVICE,RENTAL',
		description:
			'Comma-separated list of contract types (field ContractTypeName of Sales Order Contract Type). Only contracts of these types are processed.',
		routing: { send: { preSend: [sendContractTypes] } },
	},
	{
		displayName: 'To Date',
		name: 'toDate',
		type: 'dateTime',
		required: true,
		displayOptions: showFor(resource, 'generateOrders'),
		default: '',
		description:
			'Orders are created for the periods up to this date, from contracts that start on or before it. Only the date is sent.',
		routing: { send: { preSend: [sendToDate] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'generateOrders'),
		default: {},
		options: [
			filterText(
				'Customer Group',
				'customerGroup',
				'Retail',
				'Only contracts of customers in this customer group (field CustomerGroupName of Customer Group)',
			),
			filterText(
				'Customer Number From',
				'customerNumberFrom',
				'10001',
				'Only contracts of customers with this customer number or a higher one. Numbers are compared as text.',
			),
			filterText(
				'Customer Number To',
				'customerNumberTo',
				'19999',
				'Only contracts of customers with this customer number or a lower one. Numbers are compared as text.',
			),
			bodySwitch(
				'Include Sub Groups',
				'includeSubGroups',
				'Whether to include the sub groups of Customer Group',
			),
			filterText(
				'Order Number From',
				'orderNumberFrom',
				'50001',
				'Only contracts whose template sales order has this order number or a higher one. Numbers are compared as text.',
			),
			filterText(
				'Order Number To',
				'orderNumberTo',
				'59999',
				'Only contracts whose template sales order has this order number or a lower one. Numbers are compared as text.',
			),
			bodySwitch(
				'Use Pauses',
				'usePauses',
				'Whether to take the pauses of the contracts into account like order generation in myfactory does. Periods are shortened by the pauses, the rest of a period follows in a later run, and terms with SplitOrders get a quantity reduced by days. Needs ipt RestApi2 58.5.0 or later, older versions ignore it. While another order generation runs in myfactory or the API, the API answers with status 409.',
			),
		],
	},
];

export const salesOrderContractDescription: INodeProperties[] = [
	operationProperty(salesOrderContractInfo, {}, [generateOrdersOperation]),
	...createDataProperty(
		resource,
		'Fields of the new contract as a JSON object. Required are ContractDesc, ContractTypeName (a Sales Order Contract Type), CustomerID, OrderID (the template sales order whose positions the generated orders take over), CancelID (a Sales Order Contract Cancellation) and StartDate. A new contract is inactive unless Active is -1, and Generate Orders only processes active contracts. ContractNumber "*" takes the next number from the number range in myfactory. The contract also needs at least one Sales Order Contract Order entry before Generate Orders creates orders from it.',
		'{"ContractDesc": "Printer maintenance", "ContractNumber": "*", "ContractTypeName": "SERVICE", "CustomerID": 1234, "OrderID": 5678, "CancelID": 1, "StartDate": "2027-01-01", "Active": -1}',
	),
	...deleteProperties(
		salesOrderContractInfo,
		'Deleting a contract is permanent. From ipt RestApi2 58.6.1 on, the API applies the delete rules of myfactory: status 409 if the contract already has a Sales Order Contract Result from Generate Orders or another contract is linked to it, otherwise its Sales Order Contract Order entries are deleted with it. Its pauses and the template sales order are not deleted, delete the pauses first if you no longer need them. Older versions delete the contract alone without these checks and keep its order entries.',
	),
	...getProperties(salesOrderContractInfo, salesOrderContractSimplifiedFields, []),
	...getManyProperties(
		salesOrderContractInfo,
		salesOrderContractSimplifiedFields,
		[],
		{
			fields: 'ContractID,ContractNumber,ContractDesc',
			sort: '-StartDate,ContractNumber',
			filterField: 'CustomerID',
			clause: "StartDate$GT$$EQ$'20260101'",
		},
		[changedSinceOption],
	),
	...updateDataProperty(resource, '{"EndDate": "2027-12-31"}'),
	...generateOrdersDescription,
];
