import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation. A position is one entry in the history of a
// support case, for example a call, a reply or an incoming mail.
export const supportCasePositionInfo: ResourceInfo = {
	resource: 'supportCasePosition',
	path: '/supportcasepos',
	label: 'support case position',
	labelPlural: 'support case positions',
	idParameter: 'supportCasePosId',
	idDisplayName: 'Support Case Position ID',
	idField: 'PosID',
};

// The mail of a position (the incoming one, or the sent one if the position has one) with
// header and addresses. Get and Get Many offer the same list.
export const supportCasePositionIncludes: INodePropertyOptions[] = [
	{ name: 'Mail', value: 'mail' },
];

// Fields returned when Simplify is on. Get and Get Many use the same list. Mail is only filled
// with Include Mail.
export const supportCasePositionSimplifiedFields = [
	'PosID',
	'CaseID',
	'PosDate',
	'UserName',
	'PosType',
	'PosDesc',
	'PosComment',
	'PosState',
	'MailID',
	'Mail',
];

export const supportCasePositionGetDescription: INodeProperties[] = getProperties(
	supportCasePositionInfo,
	supportCasePositionSimplifiedFields,
	supportCasePositionIncludes,
);
