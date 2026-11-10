import {
	NodeOperationError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	type INodePropertyOptions,
} from 'n8n-workflow';
import {
	actionNotice,
	bodyNumber,
	bodySwitch,
	changeCurrencyProperties,
	recordAction,
	showFor,
	transformOperation,
	transformProperties,
} from '../../shared/actions';
import { idProperty } from '../../shared/resource';
import { salesOrderInfo } from './get';

// Actions of the API on one sales order: POST /salesorders/{id}/<action>
function orderAction(
	name: string,
	value: string,
	action: string,
	description: string,
	apiAction: string,
): INodePropertyOptions {
	return recordAction(salesOrderInfo, name, value, action, description, apiAction);
}

export const salesOrderActionOperations: INodePropertyOptions[] = [
	orderAction(
		'Change Currency',
		'changeCurrency',
		'Change the currency of a sales order in myfactory',
		'Switch a sales order to another currency',
		'changecurrency',
	),
	orderAction(
		'Change Customer',
		'changeCustomer',
		'Change the customer of a sales order in myfactory',
		'Move a sales order to another customer. The order keeps its number but gets a new ID.',
		'changecustomer',
	),
	orderAction(
		'Check Credit',
		'checkCredit',
		'Check the credit limit for a sales order in myfactory',
		'Check the credit limit of the customer of a sales order',
		'checkcredit',
	),
	orderAction(
		'Complete',
		'complete',
		'Complete a sales order in myfactory',
		'Mark a sales order as completed',
		'complete',
	),
	orderAction(
		'Copy',
		'copy',
		'Copy a sales order in myfactory',
		'Create a new sales order as a copy of an existing one',
		'copy',
	),
	orderAction(
		'Create Purchase Order',
		'createPurchaseOrder',
		'Create a purchase order from a sales order in myfactory',
		'Create a purchase order for a supplier from positions of a sales order',
		'createpurchaseorder',
	),
	orderAction(
		'Recalculate',
		'recalc',
		'Recalculate a sales order in myfactory',
		'Recalculate the totals and taxes of a sales order',
		'recalc',
	),
	orderAction(
		'Refresh Prices',
		'refreshPrices',
		'Refresh the prices of a sales order in myfactory',
		'Take the current prices from the price lists for all positions of a sales order',
		'refreshprices',
	),
	orderAction(
		'Renumber Positions',
		'renumberPositions',
		'Renumber the positions of a sales order in myfactory',
		'Number the positions of a sales order again in their order',
		'renumberpositions',
	),
	orderAction(
		'Set Printed',
		'setPrinted',
		'Mark a sales order as printed in myfactory',
		'Mark a processed sales order as printed without printing or sending it',
		'setprinted',
	),
	transformOperation(
		salesOrderInfo,
		'Transform a sales order into another order type in myfactory',
		'Create the follow-up document of a sales order, for example a delivery note from an order confirmation',
	),
];

const resource = salesOrderInfo.resource;

// The API expects the OrderID, which users easily confuse with the visible order number
const orderIdHint =
	'OrderID of the sales order, not the order number. Get it from Sales Order > Get Many.';

// The API expects the positions as an array of numbers. The node takes a comma-separated list,
// which is easier to fill from an expression or by an AI agent.
async function sendPositionIds(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const ids = String(this.getNodeParameter('positionIds', ''))
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id !== '');
	if (ids.length === 0 || ids.some((id) => !/^\d+$/.test(id))) {
		throw new NodeOperationError(
			this.getNode(),
			'Position IDs must be a comma-separated list of numbers',
			{ description: 'Use the OrderPosID of each position, for example 5678,5679' },
		);
	}
	requestOptions.body = {
		...(requestOptions.body as IDataObject),
		positionIds: ids.map(Number),
	};
	return requestOptions;
}

export const salesOrderActionDescription: INodeProperties[] = [
	actionNotice(
		resource,
		'changeCurrency',
		'Switches the sales order to another currency and converts the prices of its positions. Use a currency code that is set up in myfactory, because neither the API nor myfactory rejects an unknown code.',
	),
	actionNotice(
		resource,
		'changeCustomer',
		'myfactory copies the sales order to the new customer and deletes the old one. The order keeps its number but gets a new OrderID, and the old OrderID no longer exists. The addresses and the taxation always come from the new customer. With Change Conditions on (default), the order also takes over the currency and price type of the new customer and the position prices are determined again. Only offers can be moved to a prospect instead of a customer.',
	),
	actionNotice(
		resource,
		'checkCredit',
		'Checks whether the sales order fits into the credit limit of the customer. Changes nothing. Fails for a sales order without a customer.',
	),
	actionNotice(
		resource,
		'complete',
		'Marks the sales order and its main positions as completed and removes their product planning entries. Works only for processed or printed sales orders. If myfactory refuses, the API reports only a general error (status 409).',
	),
	actionNotice(
		resource,
		'copy',
		'Creates a new sales order as a copy. Without Additional Fields the copy gets the customer and the order type of the source.',
	),
	actionNotice(
		resource,
		'createPurchaseOrder',
		'Creates a purchase order at the supplier for the given positions. Supplier ID and purchase order type are values of your myfactory installation.',
	),
	actionNotice(
		resource,
		'recalc',
		'Recalculates the totals, taxes and position sums of the sales order, as after a change to a position.',
	),
	actionNotice(
		resource,
		'refreshPrices',
		'Takes the current prices from the price lists. This also overwrites prices entered by hand, unless myfactory is set up to keep fixed prices. At least one of Refresh Sales Prices and Refresh Valuation Prices must be on, otherwise the API answers with status 400.',
	),
	actionNotice(
		resource,
		'renumberPositions',
		'Numbers the positions again in their order: 1, 2, 3 …, group titles open a level (1, 1.1), text and page break lines get no number. The order of the positions does not change. Needs ipt RestApi2 57.9.0 or later.',
	),
	actionNotice(
		resource,
		'setPrinted',
		'Marks a processed sales order as printed and checks off its open entries in print batches. Nothing is printed or sent. A sales order that is already printed is returned unchanged. Use this for documents that reach the recipient by other means. Changing OrderState with Update does not do this.',
	),
	actionNotice(
		resource,
		'transform',
		'Creates the follow-up document, for example a delivery note from an order confirmation. The target order type must be allowed as a follow-up of the source order type in myfactory, otherwise the error message lists the allowed types. Fails if the source sales order is locked for transforming or has no positions left to take over.',
	),

	// Same parameter name as for Get, Update and Delete, so the ID stays when the operation changes.
	// Only this copy of the parameter carries the hint.
	{
		...idProperty(salesOrderInfo, {
			operation: [
				'changeCurrency',
				'changeCustomer',
				'checkCredit',
				'complete',
				'copy',
				'createPurchaseOrder',
				'recalc',
				'refreshPrices',
				'renumberPositions',
				'setPrinted',
			],
		}),
		hint: orderIdHint,
	},

	// Change Currency
	...changeCurrencyProperties(salesOrderInfo),

	// Change Customer
	{
		displayName: 'New Customer ID',
		// Not customerId, because that name holds the ID string of the Customer resource
		name: 'newCustomerId',
		type: 'number',
		required: true,
		displayOptions: showFor(resource, 'changeCustomer'),
		default: 0,
		description:
			'ID of the new customer (field CustomerID). For an offer to a prospect, use 0 and set Prospect ID.',
		routing: { send: { type: 'body', property: 'customerId' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'changeCustomer'),
		default: {},
		options: [
			{
				...bodySwitch(
					'Change Conditions',
					'changeConditions',
					'Whether to take over the currency and price type of the new customer and determine the position prices again. Off keeps the currency, prices and payment condition of the order.',
				),
				default: true,
			},
			{
				...bodySwitch(
					'Keep Credit Card',
					'keepCreditCard',
					'Whether to keep the credit card data of the sales order. Only has an effect when Change Conditions is off.',
				),
				default: true,
			},
			{
				...bodySwitch(
					'Keep Documents',
					'keepDocuments',
					'Whether to keep the documents linked to the sales order',
				),
				default: true,
			},
			bodyNumber('Prospect ID', 'prospectId', 'ID of the new prospect, for offers only'),
			bodySwitch(
				'Refresh Commissions',
				'refreshCommissions',
				'Whether to determine the commissions again',
			),
		],
	},

	// Copy
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'copy'),
		default: {},
		// Without these fields the copy gets the customer, prospect and order type of the source
		options: [
			bodySwitch(
				'Change Conditions',
				'changeConditions',
				'Whether to take over the current conditions of the customer',
			),
			bodyNumber('Customer ID', 'customerId', 'ID of the customer of the copy'),
			{
				...bodySwitch(
					'Keep Credit Card',
					'keepCreditCard',
					'Whether to keep the credit card data of the source',
				),
				default: true,
			},
			bodyNumber('Order Type', 'orderType', 'Number of the order type of the copy'),
			bodyNumber('Prospect ID', 'prospectId', 'ID of the prospect of the copy'),
			bodySwitch(
				'Refresh Commissions',
				'refreshCommissions',
				'Whether to determine the commissions again',
			),
			bodySwitch(
				'Refresh Discounts',
				'refreshDiscounts',
				'Whether to determine the discounts again',
			),
			bodySwitch(
				'Refresh Texts',
				'refreshTexts',
				'Whether to take the texts from the products again',
			),
		],
	},

	// Create Purchase Order
	{
		displayName: 'Supplier ID',
		name: 'supplierId',
		type: 'number',
		required: true,
		displayOptions: showFor(resource, 'createPurchaseOrder'),
		default: 0,
		description: 'ID of the supplier of the purchase order (field SupplierID)',
		routing: { send: { type: 'body', property: 'supplierId' } },
	},
	{
		displayName: 'Position IDs',
		name: 'positionIds',
		type: 'string',
		required: true,
		displayOptions: showFor(resource, 'createPurchaseOrder'),
		default: '',
		placeholder: '5678,5679',
		description:
			'Comma-separated list of the sales order positions to order (field OrderPosID). Each must belong to the sales order.',
		routing: { send: { preSend: [sendPositionIds] } },
	},
	{
		displayName: 'Purchase Order Type',
		name: 'purchaseOrderType',
		type: 'number',
		displayOptions: showFor(resource, 'createPurchaseOrder'),
		default: 0,
		description:
			'Number of the purchase order type. 0 uses the type preset in myfactory. Without a preset the API rejects the request.',
		routing: { send: { type: 'body', property: 'orderType' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'createPurchaseOrder'),
		default: {},
		options: [
			{
				displayName: 'Delivery Address',
				name: 'differentShipment',
				type: 'options',
				options: [
					{ name: 'No Separate Address', value: 0 },
					{ name: 'Address of the Sales Order', value: 1 },
					{ name: 'Delivery Address of the Sales Order', value: 2 },
				],
				default: 0,
				description:
					'Which address the supplier delivers to. No Separate Address gives the purchase order no separate delivery address.',
				routing: { send: { type: 'body', property: 'differentShipment' } },
			},
			bodySwitch(
				'Purchase Units',
				'purchaseUnits',
				'Whether to convert the quantities into the purchase unit of each product, rounded up',
			),
			bodySwitch(
				'Set Completed',
				'setCompleted',
				'Whether to mark the sales order positions as completed and delivered by the supplier',
			),
		],
	},

	// Refresh Prices
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'refreshPrices'),
		default: {},
		options: [
			{
				...bodySwitch(
					'Refresh Sales Prices',
					'refreshSalesPrices',
					'Whether to refresh the sales prices. This also overwrites prices entered by hand.',
				),
				default: true,
			},
			bodySwitch(
				'Refresh Valuation Prices',
				'refreshValuationPrices',
				'Whether to refresh the valuation prices',
			),
		],
	},

	// Transform
	...transformProperties(
		salesOrderInfo,
		orderIdHint,
		'Number of the order type of the new document, usually 3 for a delivery note. The numbers are set up in your myfactory installation. The type must be a follow-up type of the source order type in myfactory. If it is not, the error message of the API lists the allowed types.',
	),
];
