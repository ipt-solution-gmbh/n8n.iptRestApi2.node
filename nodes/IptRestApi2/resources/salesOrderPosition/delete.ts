import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { salesOrderPositionInfo } from './get';

// The positions endpoint deletes only one position by ID, so there is no Delete Multiple
export const salesOrderPositionDeleteDescription: INodeProperties[] = deleteProperties(
	salesOrderPositionInfo,
	'Deleting a position is permanent. myfactory removes it from the sales order and recalculates the order. The API does not check whether the sales order is already processed.',
);
