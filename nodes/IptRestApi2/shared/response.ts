import {
	NodeApiError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type JsonObject,
	type PostReceiveAction,
} from 'n8n-workflow';

// Every response has the envelope { Result, Status, Error }. On failure Error holds one or more
// { Message, Status } entries. The requests set ignoreHttpStatusErrors, so the messages reach
// this function and end up in the n8n error instead of a generic status text.
async function throwOnApiError(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body =
		typeof response.body === 'object' && response.body !== null
			? (response.body as IDataObject)
			: {};
	const apiErrors = Array.isArray(body.Error) ? (body.Error as IDataObject[]) : [];

	if (response.statusCode < 400 && apiErrors.length === 0) {
		return items;
	}

	const message = apiErrors
		.map((apiError) => apiError.Message)
		.filter(Boolean)
		.join(' | ');
	throw new NodeApiError(this.getNode(), body as JsonObject, {
		message: message || undefined,
		httpCode: String(response.statusCode),
	});
}

// Lists and single records both come as Result.BaseItems. Each record becomes one n8n item.
export const baseItemsOutput: PostReceiveAction[] = [
	throwOnApiError,
	{
		type: 'rootProperty',
		properties: {
			property: 'Result.BaseItems',
		},
	},
];
