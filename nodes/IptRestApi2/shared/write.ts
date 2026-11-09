import {
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
} from 'n8n-workflow';

// Sends the Data parameter as the request body. One n8n item writes one record, so the body
// must be a single JSON object. An array would mean a batch to the API.
async function sendDataAsBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const data = this.getNodeParameter('data', {}, { ensureType: 'json' });
	if (typeof data !== 'object' || data === null || Array.isArray(data)) {
		throw new NodeOperationError(this.getNode(), 'Data must be a JSON object', {
			description:
				'Write the fields of one record as an object, for example {"Matchcode": "Sample"}',
		});
	}
	requestOptions.body = data as IHttpRequestOptions['body'];
	// The API rejects POST and PUT bodies that are not declared as JSON
	requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'application/json' };
	return requestOptions;
}

// Create and Update both use the parameter name "data", each with its own description. Two
// properties with separate displayOptions also let each operation place Data in its own spot.
// Data starts as {}, so n8n never shows its placeholder. A notice right above it shows the same
// example. n8n renders notice text without line breaks or code formatting (only links and
// lists), so the example stays on one line.
function dataProperty(
	resource: string,
	operation: 'create' | 'update',
	description: string,
	example: string,
): INodeProperties[] {
	const displayOptions = {
		show: {
			resource: [resource],
			operation: [operation],
		},
	};
	return [
		{
			displayName: `${operation === 'create' ? 'Minimal example' : 'Example'}: ${example}`,
			name: `${resource}${operation === 'create' ? 'Create' : 'Update'}Example`,
			type: 'notice',
			displayOptions,
			default: '',
		},
		{
			displayName: 'Data',
			name: 'data',
			type: 'json',
			required: true,
			displayOptions,
			default: '{}',
			placeholder: example,
			description,
			routing: {
				send: {
					preSend: [sendDataAsBody],
				},
			},
		},
	];
}

// The API switches alldata on as soon as the parameter is present, even with the value false,
// so it is only sent when All Data is on. A $fromAI expression the AI agent left without a value
// resolves to undefined and counts as off.
async function sendAllData(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	if (this.getNodeParameter('allData', false) === true) {
		requestOptions.qs = { ...requestOptions.qs, alldata: 'true' };
	}
	return requestOptions;
}

// The description names what the resource needs to create a record, for example required
// fields. The example holds only the fields a new record needs. Without alldata the API answers
// a create with a few fields only. allDataDescription replaces the standard text where the
// response differs from that.
export function createDataProperty(
	resource: string,
	description: string,
	example: string,
	allDataDescription?: string,
): INodeProperties[] {
	return [
		...dataProperty(resource, 'create', description, example),
		{
			displayName: 'All Data',
			name: 'allData',
			type: 'boolean',
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['create'],
				},
			},
			default: false,
			description:
				allDataDescription ??
				'Whether to return all fields of the new record instead of a few fields only',
			routing: {
				send: {
					preSend: [sendAllData],
				},
			},
		},
	];
}

// The note explains rules of the resource that go beyond changing single fields
export function updateDataProperty(
	resource: string,
	example: string,
	note?: string,
): INodeProperties[] {
	const description = 'Fields to change as a JSON object. Only the fields given here are changed.';
	return dataProperty(
		resource,
		'update',
		note === undefined ? description : `${description} ${note}`,
		example,
	);
}
