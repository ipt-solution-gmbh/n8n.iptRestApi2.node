import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
	PreSendAction,
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
import { purchaseOrderInfo } from './get';

// Actions of the API on one purchase order: POST /purchaseorders/{id}/<action>
function orderAction(
	name: string,
	value: string,
	action: string,
	description: string,
	apiAction: string,
): INodePropertyOptions {
	return recordAction(purchaseOrderInfo, name, value, action, description, apiAction);
}

export const purchaseOrderActionOperations: INodePropertyOptions[] = [
	orderAction(
		'Change Currency',
		'changeCurrency',
		'Change the currency of a purchase order in myfactory',
		'Switch a purchase order to another currency',
		'changecurrency',
	),
	orderAction(
		'Change Supplier',
		'changeSupplier',
		'Change the supplier of a purchase order in myfactory',
		'Move a purchase order to another supplier. The order keeps its number but gets a new ID.',
		'changesupplier',
	),
	orderAction(
		'Confirm Delivery Dates',
		'confirmDeliveryDates',
		'Confirm the delivery dates of a purchase order in myfactory',
		'Record the order confirmation of the supplier for all positions of a purchase order',
		'confirmdeliverydates',
	),
	orderAction(
		'Copy',
		'copy',
		'Copy a purchase order in myfactory',
		'Create a new purchase order as a copy of an existing one',
		'copy',
	),
	orderAction(
		'Recalculate',
		'recalc',
		'Recalculate a purchase order in myfactory',
		'Recalculate the totals and taxes of a purchase order',
		'recalc',
	),
	orderAction(
		'Refresh Prices',
		'refreshPrices',
		'Refresh the prices of a purchase order in myfactory',
		'Take the current purchase prices for all product positions of a purchase order',
		'refreshprices',
	),
	orderAction(
		'Renumber Positions',
		'renumberPositions',
		'Renumber the positions of a purchase order in myfactory',
		'Number the positions of a purchase order again in their order',
		'renumberpositions',
	),
	orderAction(
		'Set Completed',
		'setCompleted',
		'Mark a purchase order as completed in myfactory',
		'Mark a processed purchase order and its main positions as completed',
		'setcompleted',
	),
	orderAction(
		'Set Printed',
		'setPrinted',
		'Mark a purchase order as printed in myfactory',
		'Mark a processed purchase order as printed without printing or sending it',
		'setprinted',
	),
	transformOperation(
		purchaseOrderInfo,
		'Transform a purchase order into another order type in myfactory',
		'Create the follow-up document of a purchase order, for example a goods receipt from an order',
	),
];

const resource = purchaseOrderInfo.resource;

// The API expects the OrderID, which users easily confuse with the visible order number
const orderIdHint =
	'OrderID of the purchase order, not the order number. Get it from Purchase Order > Get Many.';

// Sends a text parameter as a body field, but only when it has a value. The API reads an empty
// date as "no date" and rejects it. A $fromAI expression the AI agent left without a value
// resolves to undefined and counts as empty.
function sendText(parameter: string, bodyField: string): PreSendAction {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const raw = this.getNodeParameter(parameter, '');
		const value = typeof raw === 'string' ? raw.trim() : '';
		if (value !== '') {
			requestOptions.body = { ...(requestOptions.body as IDataObject), [bodyField]: value };
		}
		return requestOptions;
	};
}

export const purchaseOrderActionDescription: INodeProperties[] = [
	actionNotice(
		resource,
		'changeCurrency',
		'Switches the purchase order to another currency and converts the prices of its positions. Use a currency code that is set up in myfactory, because the API does not check the code.',
	),
	actionNotice(
		resource,
		'changeSupplier',
		'myfactory copies the purchase order to the new supplier and deletes the old one. The order keeps its number but gets a new OrderID, and the old OrderID no longer exists. With Change Conditions on (default), the order takes over the currency and price type of the new supplier and the position prices are determined again. myfactory refuses the change for a purchase order it treats as read-only or that already has an external production order.',
	),
	actionNotice(
		resource,
		'confirmDeliveryDates',
		'Records the order confirmation of the supplier for all product and manual positions of the purchase order: each gets the confirmed delivery date, keeps the date requested before and updates the material planning. Optionally sets a confirmation text for every position and the order confirmation date of the purchase order. At least one of the three values is required. A confirmation cannot be withdrawn here.',
	),
	actionNotice(
		resource,
		'copy',
		'Creates a new purchase order as a copy. Without Additional Fields the copy gets the supplier and the order type of the source.',
	),
	actionNotice(
		resource,
		'recalc',
		'Recalculates the totals, taxes and position sums of the purchase order, as after a change to a position.',
	),
	actionNotice(
		resource,
		'refreshPrices',
		'Takes the current purchase prices for all product positions. This also overwrites prices entered by hand, because the positions lose their mark as manual prices. myfactory saves the change without processing the purchase order: a processed purchase order goes to the state in progress (OrderState 2).',
	),
	actionNotice(
		resource,
		'renumberPositions',
		'Numbers the positions again in their order: 1, 2, 3 …, group titles open a level (1, 1.1), text and page break lines get no number. The order of the positions does not change. Needs ipt RestApi2 57.9.0 or later.',
	),
	actionNotice(
		resource,
		'setCompleted',
		'Marks the purchase order and its main positions as completed and removes their material planning entries. Works only for processed or printed purchase orders. Changing OrderCompleted with Update does not do this. Needs ipt RestApi2 31.8.0 or later.',
	),
	actionNotice(
		resource,
		'setPrinted',
		'Marks a processed purchase order as printed and checks off its open entries in print batches. Nothing is printed or sent. A purchase order that is already printed is returned unchanged. Use this for documents that reach the supplier by other means. Changing OrderState with Update does not do this.',
	),
	actionNotice(
		resource,
		'transform',
		'Creates the follow-up document, for example a goods receipt from an order. The new document is saved as processed, so a goods receipt books the stock at once. The target order type must be allowed as a follow-up of the source order type in myfactory, otherwise the error message lists the allowed types. Fails if the source purchase order is locked for transforming, already has an unprocessed follow-up document or has no positions left to take over. Needs ipt RestApi2 57.18.0 or later.',
	),

	// Same parameter name as for Get, Update and Delete, so the ID stays when the operation changes.
	// Only this copy of the parameter carries the hint.
	{
		...idProperty(purchaseOrderInfo, {
			operation: [
				'changeCurrency',
				'changeSupplier',
				'confirmDeliveryDates',
				'copy',
				'recalc',
				'refreshPrices',
				'renumberPositions',
				'setCompleted',
				'setPrinted',
			],
		}),
		hint: orderIdHint,
	},

	// Change Currency
	...changeCurrencyProperties(purchaseOrderInfo),

	// Change Supplier
	{
		displayName: 'New Supplier ID',
		// Not supplierId, because that name holds the ID string of the Supplier resource
		name: 'newSupplierId',
		type: 'number',
		required: true,
		displayOptions: showFor(resource, 'changeSupplier'),
		default: 0,
		description: 'ID of the new supplier (field SupplierID)',
		routing: { send: { type: 'body', property: 'supplierId' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'changeSupplier'),
		default: {},
		options: [
			{
				...bodySwitch(
					'Change Conditions',
					'changeConditions',
					'Whether to take over the currency and price type of the new supplier and determine the position prices again. Off keeps the currency, prices and payment condition of the order.',
				),
				default: true,
			},
			{
				...bodySwitch(
					'Keep Documents',
					'keepDocuments',
					'Whether to keep the documents linked to the purchase order',
				),
				default: true,
			},
			bodySwitch(
				'Refresh Texts',
				'refreshOrderTexts',
				'Whether to take the texts of the order and its positions again instead of keeping them',
			),
		],
	},

	// Confirm Delivery Dates
	{
		displayName: 'Confirmed Delivery Date',
		name: 'confirmedDeliveryDate',
		type: 'string',
		displayOptions: showFor(resource, 'confirmDeliveryDates'),
		default: '',
		placeholder: '2026-10-01',
		description:
			'Delivery date the supplier confirmed, for every product and manual position. Write it as 2026-10-01 or 01.10.2026. Leave empty to set only the confirmation text or the order confirmation date.',
		routing: { send: { preSend: [sendText('confirmedDeliveryDate', 'date')] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: showFor(resource, 'confirmDeliveryDates'),
		default: {},
		options: [
			{
				displayName: 'Confirmation Text',
				name: 'text',
				type: 'string',
				default: '',
				description:
					'Note of the supplier on the confirmation, for every product and manual position. Up to 100 characters.',
				routing: { send: { preSend: [sendText('additionalFields.text', 'text')] } },
			},
			{
				displayName: 'Order Confirmation Date',
				name: 'orderConfirmationDate',
				type: 'string',
				default: '',
				placeholder: '2026-09-28',
				description:
					'Date of the order confirmation, stored on the purchase order. Write it as 2026-09-28 or 28.09.2026.',
				routing: {
					send: {
						preSend: [sendText('additionalFields.orderConfirmationDate', 'orderConfirmationDate')],
					},
				},
			},
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
		// Without these fields the copy gets the supplier and order type of the source
		options: [
			bodySwitch(
				'Change Conditions',
				'changeConditions',
				'Whether to take over the current currency and price type of the supplier and determine the position prices again',
			),
			bodyNumber('Order Type', 'orderType', 'Number of the purchase order type of the copy'),
			bodySwitch(
				'Refresh Order Texts',
				'refreshOrderTexts',
				'Whether to take the header and footer texts again instead of copying them',
			),
			bodySwitch(
				'Refresh Position Texts',
				'refreshPosTexts',
				'Whether to take the texts of the positions from the products again',
			),
			bodyNumber('Supplier ID', 'supplierId', 'ID of the supplier of the copy'),
		],
	},

	// Transform
	...transformProperties(
		purchaseOrderInfo,
		orderIdHint,
		'Number of the purchase order type of the new document, for example of a goods receipt or a purchase invoice. The numbers are set up in your myfactory installation. The type must be a follow-up type of the source order type in myfactory. If it is not, the error message of the API lists the allowed types.',
	),
];
