import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { purchaseOrderPositionInfo } from './get';

// The positions endpoint deletes only one position by ID, so there is no Delete Multiple
export const purchaseOrderPositionDeleteDescription: INodeProperties[] = deleteProperties(
	purchaseOrderPositionInfo,
	'Deleting a position is permanent. myfactory removes it from the purchase order and recalculates the order. The API does not check whether the purchase order is already processed.',
);
