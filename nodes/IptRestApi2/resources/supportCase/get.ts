import type { INodeProperties } from 'n8n-workflow';
import { getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';

// Names of the resource, used by every operation
export const supportCaseInfo: ResourceInfo = {
	resource: 'supportCase',
	path: '/supportcases',
	label: 'support case',
	labelPlural: 'support cases',
	idParameter: 'supportCaseId',
	idDisplayName: 'Support Case ID',
	idField: 'CaseID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. The question and
// reply texts are left out, because they can be long.
export const supportCaseSimplifiedFields = [
	'CaseID',
	'CaseNumber',
	'CaseDesc',
	'AddressID',
	'ContactID',
	'CaseState',
	'CasePriority',
	'HandlingUser',
	'CreationDate',
	'ChangeDate',
];

// Every field of a support case is a base field, so lists have all fields without All Data
export const supportCaseGetDescription: INodeProperties[] = getProperties(
	supportCaseInfo,
	supportCaseSimplifiedFields,
	[],
);
