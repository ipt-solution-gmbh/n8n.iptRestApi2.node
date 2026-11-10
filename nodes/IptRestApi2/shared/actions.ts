import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { baseItemsOutput, resultOutput } from './response';
import type { ResourceInfo } from './resource';

// Building blocks for the actions of the API on one document, for example a sales order or a
// purchase order: POST <path>/{id}/<action>. Each answers with one object in Result, either the
// changed document or a short result.
export function recordAction(
	info: ResourceInfo,
	name: string,
	value: string,
	action: string,
	description: string,
	apiAction: string,
): INodePropertyOptions {
	return {
		name,
		value,
		action,
		description,
		routing: {
			request: {
				method: 'POST',
				url: `=${info.path}/{{encodeURIComponent($parameter.${info.idParameter})}}/${apiAction}`,
				// The API rejects a body that is not declared as JSON. Actions without parameters
				// ignore the body.
				headers: { 'Content-Type': 'application/json' },
				ignoreHttpStatusErrors: true,
			},
			output: {
				postReceive: resultOutput,
			},
		},
	};
}

// Transform creates the follow-up document. The API takes the source document and the target
// type from the query (see transformProperties) and answers with the new document in
// Result.BaseItems.
export function transformOperation(
	info: ResourceInfo,
	action: string,
	description: string,
): INodePropertyOptions {
	return {
		name: 'Transform',
		value: 'transform',
		action,
		description,
		routing: {
			request: {
				method: 'POST',
				url: `${info.path}/transform`,
				ignoreHttpStatusErrors: true,
			},
			output: {
				postReceive: baseItemsOutput,
			},
		},
	};
}

// Shows a parameter for one action of a resource
export function showFor(resource: string, operation: string) {
	return {
		show: {
			resource: [resource],
			operation: [operation],
		},
	};
}

// A notice at the top of one action that says what the action changes in myfactory
export function actionNotice(resource: string, operation: string, text: string): INodeProperties {
	return {
		displayName: text,
		name: `${operation}Notice`,
		type: 'notice',
		displayOptions: showFor(resource, operation),
		default: '',
	};
}

// A switch in Additional Fields that goes into the request body. Switches that the API turns on
// by default override the default with true.
export function bodySwitch(
	displayName: string,
	name: string,
	description: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'boolean',
		default: false,
		description,
		routing: { send: { type: 'body', property: name } },
	};
}

// A number in Additional Fields that goes into the request body. 0 is not sent, because the API
// takes a missing field from the source document but would use a sent 0 as the new value. A
// missing or non-numeric value is treated like 0, because an expression such as $fromAI without a
// value resolves to undefined and would otherwise be sent as null.
export function bodyNumber(
	displayName: string,
	name: string,
	description: string,
): INodeProperties {
	async function sendUnlessZero(
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const raw = this.getNodeParameter(`additionalFields.${name}`, 0);
		const value = typeof raw === 'number' ? raw : Number(raw);
		if (Number.isFinite(value) && value !== 0) {
			requestOptions.body = { ...(requestOptions.body as IDataObject), [name]: value };
		}
		return requestOptions;
	}

	return {
		displayName,
		name,
		type: 'number',
		default: 0,
		description: `${description}. 0 is not sent.`,
		routing: { send: { preSend: [sendUnlessZero] } },
	};
}

// Change Currency: the same body for every document type
export function changeCurrencyProperties(info: ResourceInfo): INodeProperties[] {
	return [
		{
			displayName: 'Currency',
			name: 'currency',
			type: 'string',
			required: true,
			displayOptions: showFor(info.resource, 'changeCurrency'),
			default: '',
			placeholder: 'USD',
			description: `Code of a currency set up in myfactory to switch the ${info.label} to. The API does not check the code.`,
			routing: { send: { type: 'body', property: 'currency' } },
		},
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			displayOptions: showFor(info.resource, 'changeCurrency'),
			default: {},
			options: [
				{
					displayName: 'Exchange Rate',
					name: 'rate',
					type: 'number',
					default: 0,
					description: 'Fixed exchange rate. 0 uses the daily rate set up in myfactory.',
					routing: { send: { type: 'body', property: 'rate' } },
				},
			],
		},
	];
}

// Parameters of Transform. They go into the query, where the API expects them.
export function transformProperties(
	info: ResourceInfo,
	sourceHint: string,
	targetTypeDescription: string,
): INodeProperties[] {
	return [
		{
			displayName: 'Source Order ID',
			name: 'sourceOrderId',
			type: 'string',
			required: true,
			displayOptions: showFor(info.resource, 'transform'),
			default: '',
			placeholder: '1234',
			description: `Numeric ID of the ${info.label} to transform (field ${info.idField})`,
			hint: sourceHint,
			routing: { send: { type: 'query', property: 'sourceorderid' } },
		},
		{
			displayName: 'Target Order Type',
			name: 'targetOrderType',
			type: 'number',
			required: true,
			displayOptions: showFor(info.resource, 'transform'),
			default: 0,
			description: targetTypeDescription,
			routing: { send: { type: 'query', property: 'targetordertype' } },
		},
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			displayOptions: showFor(info.resource, 'transform'),
			default: {},
			options: [
				{
					displayName: 'Full Copy',
					name: 'fullCopy',
					type: 'boolean',
					default: false,
					description:
						'Whether to take over all positions instead of only the positions that are still open',
					routing: { send: { type: 'query', property: 'fullcopy' } },
				},
			],
		},
	];
}
