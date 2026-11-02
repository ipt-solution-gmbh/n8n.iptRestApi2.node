import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { filterQuery, filterValues } from './filters';
import { idProperty, type ResourceInfo } from './resource';

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

// Parameters of Get. The ID parameter is shown for Update too, so Update only adds Data.
// A resource without additional data passes no includes and gets no Options.
export function getProperties(
	info: ResourceInfo,
	simplifiedFields: string[],
	includes: INodePropertyOptions[],
): INodeProperties[] {
	const properties = [
		idProperty(info, { operation: ['get', 'update'] }),
		simplifyProperty(info.resource, 'get', simplifiedFields),
	];
	if (includes.length > 0) {
		properties.push({
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add Option',
			displayOptions: {
				show: {
					resource: [info.resource],
					operation: ['get'],
				},
			},
			default: {},
			options: [includeOption(includes)],
		});
	}
	return properties;
}

// Field names of the resource that the placeholders of Get Many show
export interface GetManyExamples {
	fields: string;
	sort: string;
	filterField: string;
	clause: string;
}

// The search options of Get Many. Filters and Clause go into the query of every page request,
// because the pagination only changes the URL (see Return All).
function searchOptions(info: ResourceInfo, examples: GetManyExamples): INodeProperties[] {
	async function sendFilters(
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const filters = this.getNodeParameter('options.filters.filter', []) as IDataObject[];
		const qs = filterQuery(
			this.getNode(),
			filters,
			info.labelPlural,
			examples.filterField,
			' Use Options > Clause for dates and comparisons.',
			'',
		);
		requestOptions.qs = { ...requestOptions.qs, ...qs };
		return requestOptions;
	}

	async function sendClause(
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		// The API treats a present but empty clause as a condition, so an empty one is not sent
		const clause = String(this.getNodeParameter('options.clause', '')).trim();
		if (clause !== '') {
			// The API appends the clause to the filters with AND but without brackets, so an OR in
			// the clause would otherwise cancel the filters
			requestOptions.qs = { ...requestOptions.qs, clause: `(${clause})` };
		}
		return requestOptions;
	}

	return [
		{
			displayName: 'Clause',
			name: 'clause',
			type: 'string',
			default: '',
			placeholder: examples.clause,
			description: `SQL condition on the table columns of the ${info.labelPlural}, combined with the filters by AND. Write = as $EQ$, &lt;&gt; as $NE$, &lt; as $LT$, &gt; as $GT$, &gt;= as $GT$$EQ$, &lt;= as $LT$$EQ$, % as $P100$ and : as $2P$. Write dates as 'yyyyMMdd'. Example: BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'. Only printable ASCII (no umlauts, no line breaks) and no ; -- /* or SQL keywords such as SELECT, SET, UPDATE, CHAR or CONVERT (also inside text), otherwise the API answers with status 400. See the README for details.`,
			routing: {
				send: {
					preSend: [sendClause],
				},
			},
		},
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'fixedCollection',
			placeholder: 'Add Filter',
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			description: `Return only ${info.labelPlural} that match every filter exactly (field = value)`,
			options: filterValues(info.labelPlural, examples.filterField),
			routing: {
				send: {
					preSend: [sendFilters],
				},
			},
		},
	];
}

// Parameters of Get Many. A resource without additional data passes no includes.
export function getManyProperties(
	info: ResourceInfo,
	simplifiedFields: string[],
	includes: INodePropertyOptions[],
	examples: GetManyExamples,
): INodeProperties[] {
	const showOnlyForGetMany = {
		operation: ['getAll'],
		resource: [info.resource],
	};
	const sortOption: INodeProperties = {
		displayName: 'Sort',
		name: 'sort',
		type: 'string',
		default: '',
		placeholder: examples.sort,
		description:
			'Comma-separated list of fields to sort by. A leading minus sorts in descending order.',
		routing: {
			send: {
				type: 'query',
				property: 'sort',
			},
		},
	};
	const options = [
		allDataOption,
		fieldsOption(examples.fields),
		sortOption,
		...searchOptions(info, examples),
	];
	if (includes.length > 0) {
		options.push(includeOption(includes));
	}

	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: {
				show: showOnlyForGetMany,
			},
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: {
					paginate: '={{ $value }}',
					// 1000 is the largest page the API allows. Limit comes later in this list and
					// overrides the page size when Return All is off.
					type: 'query',
					property: 'pagesize',
					value: '1000',
				},
				operations: {
					pagination: {
						type: 'generic',
						properties: {
							continue:
								'={{ $response.body.Result.PageNumber < $response.body.Result.TotalPages }}',
							// Evaluated before every request. Before the first one $response is empty, so the
							// first page is 1. The page goes into the URL because a qs object here would
							// replace the query parameters (pagesize, fields, sort, filters) instead of adding to them.
							request: {
								url: '={{ $request.url }}?page={{ $response.body ? $response.body.Result.PageNumber + 1 : 1 }}',
							},
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					...showOnlyForGetMany,
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
				maxValue: 1000,
			},
			default: 50,
			routing: {
				send: {
					type: 'query',
					property: 'pagesize',
				},
				output: {
					maxResults: '={{$value}}',
				},
			},
			description: 'Max number of results to return',
		},
		simplifyProperty(info.resource, 'getAll', simplifiedFields),
		{
			displayName:
				'Under Options, use Filters for simple matches and Clause for dates, comparisons and OR.',
			name: `${info.resource}SearchNotice`,
			type: 'notice',
			displayOptions: {
				show: showOnlyForGetMany,
			},
			default: '',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add Option',
			displayOptions: {
				show: showOnlyForGetMany,
			},
			default: {},
			// The lint rule for alphabetical options only checks written lists, so the order is set here
			options: options.sort((a, b) => a.displayName.localeCompare(b.displayName)),
		},
	];
}
