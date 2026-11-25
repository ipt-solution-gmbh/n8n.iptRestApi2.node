import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { supportCaseInfo } from './get';

// myfactory deletes the support case together with its positions. It refuses the delete while
// times are recorded for the case, the API returns that with status 409 and the reason. The mails of the positions stay in
// myfactory, but no longer belong to a support case. Delete takes one ID only.
export const supportCaseDeleteDescription: INodeProperties[] = deleteProperties(
	supportCaseInfo,
	'Deleting a support case is permanent and also deletes all its positions in myfactory. The mails of the positions are not deleted, but they no longer belong to a support case and are no longer returned by Support Mail. myfactory refuses the delete if times are recorded for the case. The node then fails with the reason (status 409).',
);
