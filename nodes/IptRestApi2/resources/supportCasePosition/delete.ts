import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { supportCasePositionInfo } from './get';

// myfactory does not check whether the position is still needed. The mail of the position stays
// in myfactory. Delete takes one ID only.
export const supportCasePositionDeleteDescription: INodeProperties[] = deleteProperties(
	supportCasePositionInfo,
	'Deleting a position is permanent and removes it from the history of the support case. myfactory does not check whether the position is still needed. The mail of the position is not deleted, but it is no longer returned by Support Mail unless another position refers to it.',
);
