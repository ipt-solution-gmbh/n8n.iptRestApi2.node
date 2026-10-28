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
function dataProperty(
	resource: string,
	operation: 'create' | 'update',
	description: string,
	placeholder: string,
): INodeProperties {
	return {
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: [resource],
				operation: [operation],
			},
		},
		default: '{}',
		placeholder,
		description,
		routing: {
			send: {
				preSend: [sendDataAsBody],
			},
		},
	};
}

// The description names what the resource needs to create a record, for example required fields
export function createDataProperty(
	resource: string,
	description: string,
	placeholder: string,
): INodeProperties {
	return dataProperty(resource, 'create', description, placeholder);
}

export function updateDataProperty(resource: string, placeholder: string): INodeProperties {
	return dataProperty(
		resource,
		'update',
		'Fields to change as a JSON object. Only the fields given here are changed.',
		placeholder,
	);
}
