import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { downloadAttachmentOperation, supportMailDownloadDescription } from './download';
import { supportMailGetDescription, supportMailInfo } from './get';
import { supportMailGetManyDescription } from './getAll';

// The endpoint is read-only, the API answers writes with status 405
export const supportMailDescription: INodeProperties[] = [
	operationProperty(
		supportMailInfo,
		{ getDescription: 'Get a single support mail with its text and attachment list' },
		[downloadAttachmentOperation],
		['get', 'getAll'],
	),
	...supportMailGetDescription,
	...supportMailGetManyDescription,
	...supportMailDownloadDescription,
];
