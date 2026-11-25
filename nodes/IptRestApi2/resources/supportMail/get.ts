import type { INodeProperties } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation. The endpoint returns only mails that belong to
// a support case position, incoming ones and sent ones.
export const supportMailInfo: ResourceInfo = {
	resource: 'supportMail',
	path: '/supportmails',
	label: 'support mail',
	labelPlural: 'support mails',
	idParameter: 'supportMailId',
	idDisplayName: 'Support Mail ID',
	idField: 'MailID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. From, To and Content
// are objects that the API returns whole. A list has Content only with Include Content.
export const supportMailSimplifiedFields = [
	'MailID',
	'Subject',
	'MailDate',
	'ReceivedDate',
	'From',
	'To',
	'CaseID',
	'CaseNumber',
	'PosID',
	'Content',
];

// A single mail always comes with its text and attachments (Content), so Get has no options
export const supportMailGetDescription: INodeProperties[] = getProperties(
	supportMailInfo,
	supportMailSimplifiedFields,
	[],
);
