import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { deletedOutput } from './delete';
import { baseItemsOutput, throwOnApiError } from './response';
import type { ResourceInfo } from './resource';

// Descriptions of a resource that say more than the standard wording
export interface OperationTexts {
	createDescription?: string;
	getDescription?: string;
}

// The Operation parameter of a resource: Create, Delete, Get, Get Many and Update, plus the
// additional operations the resource passes. n8n builds the default tool description for AI
// agents from the action as "<action> in <node name>", so every action names myfactory.
export function operationProperty(
	info: ResourceInfo,
	texts: OperationTexts = {},
	additionalOperations: INodePropertyOptions[] = [],
): INodeProperties {
	const record = `${/^[aeiou]/.test(info.label) ? 'an' : 'a'} ${info.label}`;
	const recordUrl = `=${info.path}/{{encodeURIComponent($parameter.${info.idParameter})}}`;

	// ignoreHttpStatusErrors is set per operation, so only operations that check the response
	// with throwOnApiError accept error statuses
	const standardOperations: INodePropertyOptions[] = [
		{
			name: 'Create',
			value: 'create',
			action: `Create ${record} in myfactory`,
			description: texts.createDescription ?? `Create a new ${info.label}`,
			routing: {
				request: { method: 'POST', url: info.path, ignoreHttpStatusErrors: true },
				output: { postReceive: baseItemsOutput },
			},
		},
		{
			name: 'Delete',
			value: 'delete',
			action: `Delete ${record} in myfactory`,
			description: `Delete ${record}`,
			routing: {
				// Delete Multiple changes the URL and adds the filters (deleteProperties in delete.ts)
				request: { method: 'DELETE', url: recordUrl, ignoreHttpStatusErrors: true },
				output: { postReceive: [throwOnApiError, deletedOutput(info)] },
			},
		},
		{
			name: 'Get',
			value: 'get',
			action: `Get ${record} from myfactory`,
			description: texts.getDescription ?? `Get the data of a single ${info.label}`,
			routing: {
				request: { method: 'GET', url: recordUrl, ignoreHttpStatusErrors: true },
				output: { postReceive: baseItemsOutput },
			},
		},
		{
			name: 'Get Many',
			value: 'getAll',
			action: `Get many ${info.labelPlural} from myfactory`,
			description: `Get many ${info.labelPlural}`,
			routing: {
				request: { method: 'GET', url: info.path, ignoreHttpStatusErrors: true },
				output: { postReceive: baseItemsOutput },
			},
		},
		{
			name: 'Update',
			value: 'update',
			action: `Update ${record} in myfactory`,
			description: `Change the given fields of ${record}`,
			routing: {
				request: { method: 'PUT', url: recordUrl, ignoreHttpStatusErrors: true },
				output: { postReceive: baseItemsOutput },
			},
		},
	];

	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [info.resource],
			},
		},
		// The lint rule for alphabetical options only checks written lists, so the order is set here
		options: [...standardOperations, ...additionalOperations].sort((a, b) =>
			a.name.localeCompare(b.name),
		),
		default: 'getAll',
	};
}
