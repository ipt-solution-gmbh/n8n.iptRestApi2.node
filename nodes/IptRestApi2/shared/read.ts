import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
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

// A $fromAI expression the AI agent left without a value resolves to undefined, which counts as
// not set like an empty text
function changedSinceValue(context: IExecuteSingleFunctions): string {
	const value = context.getNodeParameter('options.changedSince', '');
	return value === undefined || value === null ? '' : String(value).trim();
}

// The API answers a list with changedsince like any list, plus ChangedUntil in the envelope.
// count=false saves the API the extra count and is recommended for changedsince.
async function sendChangedSince(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const changedSince = changedSinceValue(this);
	if (changedSince !== '') {
		requestOptions.qs = { ...requestOptions.qs, changedsince: changedSince, count: 'false' };
	}
	return requestOptions;
}

// ChangedUntil is the value for Changed Since of the next run and must reach the workflow even
// when nothing changed. So with Changed Since each page becomes one item that holds ChangedUntil,
// HasMore and the records of the page, also with no records. The records come from the response,
// because the operation has already turned them into items.
async function changesOutput(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (changedSinceValue(this) === '') {
		return items;
	}
	const result = ((response.body as IDataObject).Result ?? {}) as IDataObject;
	return [
		{
			json: {
				ChangedUntil: result.ChangedUntil,
				HasMore: result.HasMore === true,
				Records: Array.isArray(result.BaseItems) ? result.BaseItems : [],
			},
		},
	];
}

// Get Many option for endpoints whose records have ChangeDate or CreationDate. The API returns
// the records created or changed at or after the given time. Each resource passes it as an
// additional option, because the API answers it with status 400 on other endpoints.
export const changedSinceOption: INodeProperties = {
	displayName: 'Changed Since',
	name: 'changedSince',
	type: 'dateTime',
	default: '',
	description:
		'Return only records created or changed at or after this time. The output then becomes one item per page with ChangedUntil, HasMore and Records, also when nothing changed. Turn on Return All and use ChangedUntil of the first item as Changed Since of the next run.',
	routing: {
		send: {
			preSend: [sendChangedSince],
		},
		output: {
			postReceive: [changesOutput],
		},
	},
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
		// Get has no Fields and no All Data option, the fallbacks apply there. A $fromAI expression
		// the AI agent left without a value resolves to undefined, which counts as empty.
		const fieldsValue = this.getNodeParameter('options.fields', '');
		const ownFields = (typeof fieldsValue === 'string' ? fieldsValue : '')
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
			placeholder: 'Add option',
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

// The clause of Options in brackets, or '' without one. The API treats a present but empty clause
// as a condition, so an empty one must not be sent. A $fromAI expression the AI agent left without
// a value resolves to undefined, and String(undefined) would send the clause (undefined).
export function bracketedClause(context: IExecuteSingleFunctions): string {
	const clauseValue = context.getNodeParameter('options.clause', '');
	const clause = typeof clauseValue === 'string' ? clauseValue.trim() : '';
	// The API appends the clause to the filters with AND but without brackets, so an OR in the
	// clause would otherwise cancel the filters
	return clause === '' ? '' : `(${clause})`;
}

async function sendClause(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const clause = bracketedClause(this);
	if (clause !== '') {
		requestOptions.qs = { ...requestOptions.qs, clause };
	}
	return requestOptions;
}

// The Clause option of a list. The condition sentence says what the clause works on, the rest of
// the description is the syntax the API accepts. The clause goes into the query of every page
// request, because the pagination only changes the URL (see Return All).
export function clauseOption(
	condition: string,
	rangeExample: string,
	placeholder: string,
): INodeProperties {
	return {
		displayName: 'Clause',
		name: 'clause',
		type: 'string',
		default: '',
		placeholder,
		description: `${condition} Write = as $EQ$, &lt;&gt; as $NE$, &lt; as $LT$, &gt; as $GT$, &gt;= as $GT$$EQ$, &lt;= as $LT$$EQ$, % as $P100$ and : as $2P$. Write dates as 'yyyyMMdd'. Example: BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'. Only printable ASCII (no umlauts, no line breaks) and no ; -- /* or SQL keywords such as SELECT, SET, UPDATE, CHAR or CONVERT (also inside text), otherwise the API answers with status 400. Keep it under 2000 characters: instead of a long IN (...) list, filter on another field or use a range such as ${rangeExample} and continue with the next range. See the README for details.`,
		routing: {
			send: {
				preSend: [sendClause],
			},
		},
	};
}

// The search options of Get Many. Filters go into the query of every page request, like Clause.
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

	return [
		clauseOption(
			`SQL condition on the table columns of the ${info.labelPlural}, combined with the filters by AND.`,
			// A text key needs quotes in the range example
			info.textKeyExample === undefined ? `${info.idField}$GT$5000` : `${info.idField}$GT$$EQ$'M'`,
			examples.clause,
		),
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

// Return All and Limit of a list. Both send the page size, Return All also reads every page.
export function paginationProperties(resource: string): INodeProperties[] {
	const showOnlyForGetMany = {
		operation: ['getAll'],
		resource: [resource],
	};
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
							// With count=false (sent by Changed Since) the API reports no TotalPages (-1) but
							// HasMore. Without it, HasMore is missing from the response.
							continue:
								'={{ $response.body.Result.HasMore === true || $response.body.Result.PageNumber < $response.body.Result.TotalPages }}',
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
	];
}

// Parameters of Get Many. A resource without additional data passes no includes. Additional
// options are added to Options, an additional option with the name of a standard option replaces
// it, for example a Clause that also takes a date range.
export function getManyProperties(
	info: ResourceInfo,
	simplifiedFields: string[],
	includes: INodePropertyOptions[],
	examples: GetManyExamples,
	additionalOptions: INodeProperties[] = [],
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
	const standardOptions = [
		allDataOption,
		fieldsOption(examples.fields),
		sortOption,
		...searchOptions(info, examples),
	];
	if (includes.length > 0) {
		standardOptions.push(includeOption(includes));
	}
	const options = [
		...standardOptions.filter(
			(option) => !additionalOptions.some((additional) => additional.name === option.name),
		),
		...additionalOptions,
	];

	return [
		...paginationProperties(info.resource),
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
			placeholder: 'Add option',
			displayOptions: {
				show: showOnlyForGetMany,
			},
			default: {},
			// The lint rule for alphabetical options only checks written lists, so the order is set here
			options: options.sort((a, b) => a.displayName.localeCompare(b.displayName)),
		},
	];
}
