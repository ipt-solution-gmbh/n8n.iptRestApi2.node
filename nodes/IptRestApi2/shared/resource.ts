import {
	NodeOperationError,
	type IDisplayOptions,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	type PreSendAction,
} from 'n8n-workflow';

// Names of a resource as they appear in node parameters, texts and API fields
export interface ResourceInfo {
	// Value of the Resource parameter, for example "salesOrder"
	resource: string;
	// API path of the endpoint, for example "/salesorders"
	path: string;
	// Name of one record in texts, for example "sales order"
	label: string;
	// Name of several records in texts, for example "sales orders"
	labelPlural: string;
	// Parameter that holds the record ID, for example "salesOrderId"
	idParameter: string;
	// Display name of that parameter, for example "Sales Order ID"
	idDisplayName: string;
	// Primary key field in the API, for example "OrderID"
	idField: string;
	// Only for endpoints with a text key, for example "kg" for units. Get, Update and Delete send
	// the key as a query parameter named after the key field (GET /units?UnitName=kg).
	textKeyExample?: string;
}

// Without the key filter Get would return the whole list, so an empty key stops the node before
// the request
function sendTextKey(info: ResourceInfo): PreSendAction {
	return async function (this: IExecuteSingleFunctions, requestOptions: IHttpRequestOptions) {
		// A $fromAI expression the AI agent left without a value resolves to undefined
		const value = this.getNodeParameter(info.idParameter, '');
		const key = value === undefined || value === null ? '' : String(value);
		if (key.trim() === '') {
			throw new NodeOperationError(this.getNode(), `${info.idDisplayName} is empty`, {
				description: `Enter the key of the ${info.label}, for example ${info.textKeyExample}.`,
			});
		}
		requestOptions.qs = { ...requestOptions.qs, [info.idField]: key };
		return requestOptions;
	};
}

// The ID parameter of a record. Several operations share the parameter name, each resource
// defines it once for Get and Update and once for Delete.
export function idProperty(
	info: ResourceInfo,
	show: NonNullable<IDisplayOptions['show']>,
): INodeProperties {
	const property: INodeProperties = {
		displayName: info.idDisplayName,
		name: info.idParameter,
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [info.resource],
				...show,
			},
		},
		default: '',
		placeholder: 'e.g. 1234',
		description: `Numeric ID of the ${info.label} (field ${info.idField})`,
	};
	if (info.textKeyExample === undefined) {
		return property;
	}
	return {
		...property,
		placeholder: `e.g. ${info.textKeyExample}`,
		description: `Key of the ${info.label}, the text in the field ${info.idField}`,
		routing: {
			send: {
				preSend: [sendTextKey(info)],
			},
		},
	};
}
