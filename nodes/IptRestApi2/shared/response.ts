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
export async function throwOnApiError(
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
	// The API answers filters or a clause that SQL Server rejects with status 400 and the database
	// message, which alone does not say how to fix the request
	const clauseHint =
		response.statusCode === 400 && message.startsWith('Filter produced invalid SQL')
			? "Check Filters and Clause: use column names of the table. In the Clause write $EQ$ instead of =, text in single quotes, dates as 'yyyyMMdd' and no long IN lists."
			: undefined;
	throw new NodeApiError(this.getNode(), body as JsonObject, {
		message: message || undefined,
		description: clauseHint,
		httpCode: String(response.statusCode),
	});
}

// Actions that answer with a single object in Result (for example the recalculated sales order or
// the result of a check) return it as one n8n item
export const resultOutput: PostReceiveAction[] = [
	throwOnApiError,
	{
		type: 'rootProperty',
		properties: {
			property: 'Result',
		},
	},
];

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
