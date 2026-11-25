import {
	NodeOperationError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
} from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// The update of a support case takes the case from CaseID in the body, not from the URL. The
// preSend of Data builds the body first, because Data comes earlier in the property list.
async function sendCaseId(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const caseId = Number(this.getNodeParameter('supportCaseId'));
	if (!Number.isInteger(caseId) || caseId <= 0) {
		throw new NodeOperationError(this.getNode(), 'Support Case ID must be a positive number', {
			description: 'Use the CaseID of the support case, not its case number',
		});
	}
	requestOptions.body = { ...(requestOptions.body as IDataObject), CaseID: caseId };
	return requestOptions;
}

// Support Case ID comes from get.ts. index.ts spreads this list after it, so Data appears below
// it. The API changes address, contact, handling user, priority, department and state like the
// support case dialog. It answers with the sent fields.
export const supportCaseUpdateDescription: INodeProperties[] = [
	...updateDataProperty(
		'supportCase',
		'{"CaseState": 2, "HandlingUser": "JS"}',
		'Each change of AddressID, ContactID, HandlingUser, CasePriority, SupportDepartment or CaseState adds an entry to the history of the case, like the support case dialog. The same value sent again adds none. A new AddressID without ContactID clears the contact. A ContactID that is not a contact of the address of the case, or a HandlingUser that is not a myfactory user, is rejected with status 400 and nothing is changed. Setting CaseState to the completion state of the support settings closes the case, another state reopens a closed case. The response holds only the sent fields and CaseID, use Get to read all fields.',
	),
	{
		displayName: 'Case ID in Body',
		name: 'supportCaseUpdateCaseId',
		type: 'hidden',
		displayOptions: {
			show: {
				resource: ['supportCase'],
				operation: ['update'],
			},
		},
		default: '',
		routing: {
			send: {
				preSend: [sendCaseId],
			},
		},
	},
];
