import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Support Case Position ID comes from get.ts. index.ts spreads this list after it, so Data
// appears below it. The API refuses to move a position to another case or to change its creator,
// and to empty PosType, PosDesc or UserName.
export const supportCasePositionUpdateDescription: INodeProperties[] = [
	...updateDataProperty(
		'supportCasePosition',
		'{"PosComment": "Customer confirmed the fix"}',
		'CaseID and CreationUser cannot be changed. PosType, PosDesc and UserName must not be empty. myfactory marks the support case as changed.',
	),
];
