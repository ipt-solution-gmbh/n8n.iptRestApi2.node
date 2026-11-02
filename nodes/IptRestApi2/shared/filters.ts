import {
	NodeOperationError,
	type IDataObject,
	type INode,
	type INodePropertyCollection,
} from 'n8n-workflow';

// Query parameters the node does not accept as a field filter. Most of them the API never uses as
// a filter and drops silently while building the WHERE clause, so a filter with such a name would
// have no effect: Get Many would return unfiltered records, and Delete Multiple with no filter left
// would delete every record of the endpoint. Sources in the API: excluded parameters, switches for
// additional data, reserved keywords and action parameters. A few names (for example bookingdate,
// prices, discounts) are column filters on some endpoints of current API versions, but older
// versions dropped them as well. The node refuses them everywhere, Get Many offers Clause instead.
const nonFilterParameters = [
	'_resetduplicatecache',
	'alldata',
	'attributes',
	'attributetargets',
	'bookingdate',
	'clause',
	'clientid',
	'commissions',
	'discounts',
	'distinct',
	'download',
	'entityid',
	'exec',
	'execute',
	'expand',
	'fields',
	'filter',
	'force',
	'format',
	'from',
	'fullcopy',
	'groupby',
	'having',
	'history',
	'into',
	'limit',
	'logdatefrom',
	'logdateto',
	'multidelete',
	'multiean',
	'offset',
	'orderby',
	'page',
	'pagesize',
	'parameters',
	'payload',
	'payments',
	'positions',
	'prices',
	'products',
	'reftype',
	'resolveactiontypes',
	'resolveusers',
	'search',
	'select',
	'since',
	'skip',
	'sort',
	'sourceorderid',
	'table',
	'targetordertype',
	'taxes',
	'top',
	'transferaccounting',
	'union',
	'variants',
	'where',
];

// The API ignores filter names that are not plain column names, with the same effect as above
const columnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// The entries of a Filters parameter: a list of field name and value pairs
export function filterValues(
	labelPlural: string,
	filterExample: string,
): INodePropertyCollection[] {
	return [
		{
			displayName: 'Filter',
			name: 'filter',
			values: [
				{
					displayName: 'Field Name',
					name: 'field',
					type: 'string',
					default: '',
					placeholder: filterExample,
					description: `Name of a field of ${labelPlural}. Upper and lower case do not matter.`,
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					// The API converts the value by the type of the field, accepting ISO and German
					// date and number formats. Yes/no fields of myfactory store -1 and 0.
					description:
						'The field must have exactly this value. Write dates as 2026-10-01 or 01.10.2026, decimals with a point or a comma, and yes/no fields as -1 (yes) or 0 (no).',
				},
			],
		},
	];
}

// Turns the filters into query parameters (field=value). Every check runs before the request, so
// a filter the API would drop never reaches it. The name hint is added to the error for a refused
// field name, the note to every error description, for example to say that nothing was deleted.
export function filterQuery(
	node: INode,
	filters: IDataObject[],
	labelPlural: string,
	filterExample: string,
	nameHint: string,
	note: string,
): IDataObject {
	const qs: IDataObject = {};
	for (const filter of filters) {
		const field = String(filter.field ?? '').trim();
		const value = String(filter.value ?? '');
		if (!columnNamePattern.test(field) || nonFilterParameters.includes(field.toLowerCase())) {
			throw new NodeOperationError(node, `"${field}" cannot be used as a filter`, {
				description: `Use a field name of ${labelPlural}, for example ${filterExample}.${nameHint}${note}`,
			});
		}
		// SQL Server ignores trailing spaces when comparing strings, so a value of only spaces
		// would match every record with an empty field. The value itself is sent unchanged.
		if (value.trim() === '') {
			throw new NodeOperationError(node, `The filter "${field}" has no value`, {
				description: `Every filter needs a value.${note}`,
			});
		}
		if (Object.keys(qs).some((name) => name.toLowerCase() === field.toLowerCase())) {
			throw new NodeOperationError(node, `The filter "${field}" is set twice`, {
				description: `Use each field only once.${note}`,
			});
		}
		qs[field] = value;
	}
	return qs;
}
