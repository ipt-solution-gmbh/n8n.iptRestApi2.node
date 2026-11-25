import type {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { throwOnApiError } from '../../shared/response';

const showOnlyForDownload = {
	resource: ['supportMail'],
	operation: ['downloadAttachment'],
};

// Content-Disposition carries the file name in quotes. Node.js reads response headers as Latin-1,
// so a name the server wrote as UTF-8 is decoded again. If that fails, the name stays as read.
function fileNameFromHeader(header: unknown): string | undefined {
	const match = /filename="([^"]*)"/i.exec(String(header ?? ''));
	if (!match || match[1] === '') return undefined;
	const decoded = Buffer.from(match[1], 'latin1').toString('utf8');
	return decoded.includes('�') ? match[1] : decoded;
}

// The request asks for the raw bytes, so the body is a Buffer, also for an error. An error body
// holds the usual JSON envelope, which throwOnApiError turns into the node error.
async function attachmentOutput(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body = Buffer.isBuffer(response.body) ? response.body : Buffer.from(String(response.body));
	if (response.statusCode >= 400) {
		let envelope: unknown = {};
		try {
			envelope = JSON.parse(body.toString('utf8'));
		} catch {
			// Not JSON: throwOnApiError reports the status code alone
		}
		await throwOnApiError.call(this, items, { ...response, body: envelope as object });
	}

	const fileName = fileNameFromHeader(response.headers['content-disposition']);
	const mimeType = String(response.headers['content-type'] ?? '')
		.split(';')[0]
		.trim();
	const binaryPropertyName = String(this.getNodeParameter('binaryPropertyName', 'data'));
	const binaryData = await this.helpers.prepareBinaryData(
		body,
		fileName,
		mimeType === '' ? undefined : mimeType,
	);
	return [
		{
			json: {
				DocumentID: Number(this.getNodeParameter('documentId')),
				FileName: binaryData.fileName,
				MimeType: binaryData.mimeType,
				FileSize: body.length,
			},
			binary: { [binaryPropertyName]: binaryData },
		},
	];
}

// GET /documentstore/{id}?download=true returns the file of a document. The attachments of a
// support mail are documents, listed with their DocumentID under Content.Attachments.
export const downloadAttachmentOperation: INodePropertyOptions = {
	name: 'Download Attachment',
	value: 'downloadAttachment',
	action: 'Download a support mail attachment from myfactory',
	description: 'Download the file of a mail attachment as binary data',
	routing: {
		request: {
			method: 'GET',
			url: '=/documentstore/{{encodeURIComponent($parameter.documentId)}}',
			qs: { download: 'true' },
			encoding: 'arraybuffer',
			ignoreHttpStatusErrors: true,
		},
		output: {
			postReceive: [attachmentOutput],
		},
	},
};

export const supportMailDownloadDescription: INodeProperties[] = [
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForDownload,
		},
		default: '',
		placeholder: '4321',
		description:
			'DocumentID of the attachment, listed under Content.Attachments of a support mail (Get, or Get Many with Include Content). If rights are set for the access point, the API key needs the read right for the document store.',
	},
	{
		displayName: 'Put Output File in Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForDownload,
		},
		default: 'data',
		hint: 'The name of the output binary field to put the file in',
	},
];
