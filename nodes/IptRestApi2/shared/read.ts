import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';

// Options for the "Options" collection of Get and Get Many. Each resource passes the
// additional data its endpoint can load, for example attributes or variants.
export function includeOption(includes: INodePropertyOptions[]): INodeProperties {
	return {
		displayName: 'Include',
		name: 'include',
		type: 'multiOptions',
		options: includes,
		default: [],
		description: 'Additional data to load with each record',
		routing: {
			send: {
				// One expand parameter instead of one switch per name, because on some endpoints a
				// parameter like "prices" filters a column of the same name instead of loading data.
				// An empty expand is ignored by the API.
				type: 'query',
				property: 'expand',
				value: '={{ $value.join(",") }}',
			},
		},
	};
}

// Fields and All Data have no routing of their own. The preSend of simplifyProperty reads them
// and sets fields and alldata in one place, because the three settings depend on each other.
export function fieldsOption(placeholder: string): INodeProperties {
	return {
		displayName: 'Fields',
		name: 'fields',
		type: 'string',
		default: '',
		placeholder,
		description: 'Comma-separated list of fields to return. Leave empty for all fields.',
	};
}

// Lists return only the base fields of each record. A single record always has all fields.
export const allDataOption: INodeProperties = {
	displayName: 'All Data',
	name: 'allData',
	type: 'boolean',
	default: false,
	description: 'Whether to return all fields of each record instead of the base fields only',
};

// Simplify asks the API for a short, fixed list of fields per resource, which keeps the output
// small, for example when an AI agent reads it. Fields set by the user under Options win.
export function simplifyProperty(
	resource: string,
	operation: 'get' | 'getAll',
	simplifiedFields: string[],
): INodeProperties {
	async function sendFieldSelection(
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		// Get has no Fields and no All Data option, the fallbacks apply there
		const ownFields = String(this.getNodeParameter('options.fields', ''))
			.split(',')
			.map((field) => field.trim())
			.filter((field) => field !== '');
		const simplify = this.getNodeParameter('simplify', false) === true;
		const allData = this.getNodeParameter('options.allData', false) === true;

		const fields = ownFields.length > 0 ? ownFields : simplify ? simplifiedFields : [];
		const qs = { ...requestOptions.qs };
		if (fields.length > 0) {
			qs.fields = fields.join(',');
		}
		// The API switches alldata on as soon as the parameter is present, even with the value
		// false, so it is only sent when needed. A list without it returns only the base fields,
		// even if fields names more of them. A single record always has all fields.
		if (operation === 'getAll' && (fields.length > 0 || allData)) {
			qs.alldata = 'true';
		}
		requestOptions.qs = qs;
		return requestOptions;
	}

	return {
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [resource],
				operation: [operation],
			},
		},
		default: false,
		description: `Whether to return only these fields instead of the raw data: ${simplifiedFields.join(', ')}`,
		routing: {
			send: {
				preSend: [sendFieldSelection],
			},
		},
	};
}
