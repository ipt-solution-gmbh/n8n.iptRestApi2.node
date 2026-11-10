import {
	NodeOperationError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type INodeProperties,
	type PostReceiveAction,
} from 'n8n-workflow';
import { filterQuery, filterValues } from './filters';
import { idProperty, type ResourceInfo } from './resource';

// Parameters of Delete. The notice tells what deleting a record of the resource means. With
// filterExample the resource also gets the switch Delete Multiple, which deletes every record
// that matches a list of field filters. Without it, Delete takes one ID only.
export function deleteProperties(
	info: ResourceInfo,
	notice: string,
	filterExample?: string,
): INodeProperties[] {
	const deleteNotice: INodeProperties = {
		displayName: notice,
		name: `${info.resource}DeleteNotice`,
		type: 'notice',
		displayOptions: {
			show: {
				resource: [info.resource],
				operation: ['delete'],
			},
		},
		default: '',
	};

	if (filterExample === undefined) {
		return [deleteNotice, idProperty(info, { operation: ['delete'] })];
	}

	// Turns the filters into query parameters for DELETE <path>?...&multidelete=true. Every
	// check runs before the request, so an invalid filter list never reaches the API.
	async function sendDeleteFilters(
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		if (!this.getNodeParameter('deleteMultiple', false)) {
			return requestOptions;
		}

		const filters = this.getNodeParameter('filters.filter', []) as IDataObject[];
		const qs = filterQuery(
			this.getNode(),
			filters,
			info.labelPlural,
			filterExample as string,
			' Delete Multiple only accepts fields that must equal a value.',
			' Nothing was deleted.',
		);
		// With multidelete=true and no filter the API deletes every record of the endpoint
		if (Object.keys(qs).length === 0) {
			throw new NodeOperationError(this.getNode(), 'Delete Multiple needs at least one filter', {
				description: `Without a filter the API would delete every ${info.label}. Nothing was deleted.`,
			});
		}

		requestOptions.url = info.path;
		// The API checks for exactly the lowercase value "true"
		requestOptions.qs = { ...qs, multidelete: 'true' };
		return requestOptions;
	}

	return [
		deleteNotice,
		// Same parameter name as for Get and Update, but only shown while Delete Multiple is off
		idProperty(info, { operation: ['delete'], deleteMultiple: [false] }),
		{
			displayName: 'Delete Multiple',
			name: 'deleteMultiple',
			type: 'boolean',
			// A fixed value, so neither an expression nor an AI agent can switch it on
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: [info.resource],
					operation: ['delete'],
				},
			},
			default: false,
			description: `Whether to delete every ${info.label} that matches the filters instead of one ${info.label} by ID`,
			routing: {
				send: {
					preSend: [sendDeleteFilters],
				},
			},
		},
		{
			displayName: `All ${info.labelPlural} that match every filter are deleted, one after the other. The delete stops at the first ${info.label} that is still in use, and the ${info.labelPlural} deleted before stay deleted. Check the filters with Get Many first.`,
			name: 'deleteMultipleNotice',
			type: 'notice',
			displayOptions: {
				show: {
					resource: [info.resource],
					operation: ['delete'],
					deleteMultiple: [true],
				},
			},
			default: '',
		},
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'fixedCollection',
			required: true,
			placeholder: 'Add Filter',
			typeOptions: {
				multipleValues: true,
			},
			displayOptions: {
				show: {
					resource: [info.resource],
					operation: ['delete'],
					deleteMultiple: [true],
				},
			},
			default: {},
			description: `Only ${info.labelPlural} that match every filter exactly (field = value) are deleted`,
			options: filterValues(info.labelPlural, filterExample),
		},
	];
}

// The API answers with the deleted records as they were before the delete, in Result. One short
// item confirms the delete instead, so a tool call does not return whole records. The endpoints
// of sales and purchase orders and their positions answer without Result, there the ID comes from
// the parameter.
export function deletedOutput(info: ResourceInfo): PostReceiveAction {
	return async function (
		this: IExecuteSingleFunctions,
		_items: INodeExecutionData[],
		response: IN8nHttpFullResponse,
	): Promise<INodeExecutionData[]> {
		const body = response.body as IDataObject;
		const records = Array.isArray(body.Result) ? (body.Result as IDataObject[]) : [];

		if (this.getNodeParameter('deleteMultiple', false)) {
			return [
				{
					json: {
						deleted: true,
						[`${info.idField}s`]: records.map((record) => record[info.idField]),
					},
				},
			];
		}
		const id = records[0]?.[info.idField] ?? Number(this.getNodeParameter(info.idParameter));
		return [{ json: { deleted: true, [info.idField]: id } }];
	};
}
