import {
	NodeOperationError,
	validateFieldType,
	type FieldType,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
	type INodeProperties,
	type PreSendAction,
	type ResourceMapperField,
	type ResourceMapperFields,
	type ResourceMapperValue,
} from 'n8n-workflow';
import type { ResourceInfo } from './resource';

// Sends the Data parameter merged with the Fields parameter as the request body. Data is the
// base, a field set in Fields replaces the same key from Data. Empty fields are not sent, so
// they never clear a value given in Data. To clear a field on purpose, use Data. One n8n item
// writes one record, so the body must be a single JSON object. An array would mean a batch to
// the API.
function sendDataAsBody(fieldsParameter: string): PreSendAction {
	return async function (this: IExecuteSingleFunctions, requestOptions: IHttpRequestOptions) {
		const data = this.getNodeParameter('data', {}, { ensureType: 'json' });
		if (typeof data !== 'object' || data === null || Array.isArray(data)) {
			throw new NodeOperationError(this.getNode(), 'Data must be a JSON object', {
				description:
					'Write the fields of one record as an object, for example {"Matchcode": "Sample"}',
			});
		}
		// Reading ".value" would make n8n convert every field to its type, including empty ones,
		// and an expression that resolves to "" in a date field would stop the node. So the node
		// reads the whole parameter, with expressions resolved but values as entered, drops the
		// empty fields and converts only the others, with the same n8n function and options that
		// ".value" uses. A value without a stored schema, for example from an imported workflow,
		// is sent as entered.
		const fields = this.getNodeParameter(fieldsParameter, null) as ResourceMapperValue | null;
		const body: IDataObject = { ...(data as IDataObject) };
		for (const [name, value] of Object.entries(fields?.value ?? {})) {
			if (value === null || value === undefined || value === '') continue;
			const type = fields?.schema?.find((field) => field.id === name)?.type;
			if (!type) {
				body[name] = value;
				continue;
			}
			const result = validateFieldType(name, value, type);
			if (!result.valid) {
				throw new NodeOperationError(this.getNode(), `Invalid value for field '${name}'`, {
					itemIndex: this.getItemIndex(),
					description: result.errorMessage,
				});
			}
			// A date comes back as a Luxon DateTime. n8n turns it into a string on the ".value" path
			// too, with toString().
			body[name] = type === 'dateTime' ? String(result.newValue) : result.newValue;
		}
		requestOptions.body = body;
		// The API rejects POST and PUT bodies that are not declared as JSON
		requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'application/json' };
		return requestOptions;
	};
}

// Create and Update both use the parameter name "data", each with its own description. Two
// properties with separate displayOptions also let each operation place Data in its own spot.
// Data starts as {}, so n8n never shows its placeholder. A notice right above it shows the same
// example. n8n renders notice text without line breaks or code formatting (only links and
// lists), so the example stays on one line.
// Fields gets its own name per resource and operation. n8n keeps the value of a parameter name
// when the resource changes, and a shared name would carry the field list of one endpoint over
// to another.
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
	const operationName = operation === 'create' ? 'Create' : 'Update';
	const fieldsParameter = `${resource}${operationName}Fields`;
	return [
		{
			displayName: `${operation === 'create' ? 'Minimal example' : 'Example'}: ${example}`,
			name: `${resource}${operationName}Example`,
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
					preSend: [sendDataAsBody(fieldsParameter)],
				},
			},
		},
		{
			displayName: 'Fields',
			name: fieldsParameter,
			type: 'resourceMapper',
			noDataExpression: true,
			displayOptions,
			default: {
				mappingMode: 'defineBelow',
				value: null,
			},
			description:
				'Fields to send, as listed in the API description of the endpoint. A field set here replaces the same field in Data.',
			typeOptions: {
				resourceMapper: {
					resourceMapperMethod: 'getWriteFields',
					// The mode "update" needs a matching column. The record ID comes from its own
					// parameter, so both operations only pick fields and values.
					mode: 'add',
					valuesLabel: operation === 'create' ? 'Values to Send' : 'Values to Update',
					fieldWords: {
						singular: 'field',
						plural: 'fields',
					},
					addAllFields: false,
					supportAutoMap: false,
				},
			},
		},
	];
}

// The parts of the OpenAPI document of the API that describe request bodies
interface OpenApiSchema {
	$ref?: string;
	type?: string;
	format?: string;
	properties?: Record<string, OpenApiSchema>;
}

interface OpenApiDocument {
	paths?: Record<
		string,
		Record<string, { requestBody?: { content?: Record<string, { schema?: OpenApiSchema }> } }>
	>;
	components?: { schemas?: Record<string, OpenApiSchema> };
}

function fieldType(schema: OpenApiSchema): FieldType {
	if (schema.type === 'integer' || schema.type === 'number') return 'number';
	if (schema.type === 'boolean') return 'boolean';
	// Lists of simple values, for example further EAN numbers of a product
	if (schema.type === 'array') return 'array';
	if (schema.format === 'date-time') return 'dateTime';
	return 'string';
}

// Loads the fields for the Fields parameter from openapi.json of the installation, so they
// always match its version. The request body of POST (create) and PUT (update) refers to a
// write schema that holds the simple fields of the record. Lists such as sales order positions
// are not part of it and stay possible through Data. The schema marks no field as required.
// Update takes the record ID from its own parameter, so its field list leaves the ID field out.
export function writeFieldsLoader(
	resources: ResourceInfo[],
): (this: ILoadOptionsFunctions) => Promise<ResourceMapperFields> {
	return async function (this: ILoadOptionsFunctions) {
		const resource = this.getCurrentNodeParameter('resource');
		const operation = this.getCurrentNodeParameter('operation');
		const info = resources.find((entry) => entry.resource === resource);

		const credentials = await this.getCredentials('iptRestApi2Api');
		const baseUrl = String(credentials.baseUrl).replace(/\/+$/, '');
		const document = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'iptRestApi2Api',
			{ method: 'GET', url: `${baseUrl}/ipt/api/openapi.json`, json: true },
		)) as OpenApiDocument;

		const method = operation === 'create' ? 'post' : 'put';
		const reference =
			document.paths?.[`/ipt/api${info?.path}`]?.[method]?.requestBody?.content?.[
				'application/json'
			]?.schema?.$ref ?? '';
		const schemaName = reference.replace('#/components/schemas/', '');
		const properties = document.components?.schemas?.[schemaName]?.properties ?? {};
		const fieldNames = Object.keys(properties).filter(
			(name) => operation === 'create' || name !== info?.idField,
		);

		const fields: ResourceMapperField[] = fieldNames.map((name) => ({
			id: name,
			displayName: name,
			type: fieldType(properties[name]),
			required: false,
			defaultMatch: false,
			display: true,
			removed: true,
		}));
		return {
			fields,
			emptyFieldsNotice:
				'The API description of this installation lists no fields for this operation. Use Data instead.',
		};
	};
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

// For documents with positions such as sales and purchase orders. Without query parameters the
// API answers a create like a list request: only the base fields and no positions. positions is
// always sent, so the response always has the positions. All Data (alldata) adds the remaining
// header fields. The API checks only that the parameters are present.
export function returnPositionsProperty(resource: string): INodeProperties {
	return {
		displayName: 'Return Positions',
		name: `${resource}CreateQuery`,
		type: 'hidden',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: '',
		routing: {
			request: {
				qs: {
					positions: 'true',
				},
			},
		},
	};
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
