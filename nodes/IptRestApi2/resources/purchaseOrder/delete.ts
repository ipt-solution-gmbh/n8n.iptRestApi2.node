import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { purchaseOrderInfo } from './get';

// The purchase orders endpoint deletes only one order by ID, so there is no Delete Multiple. When
// myfactory refuses, the API drops the reason and answers only "Order could not be deleted".
export const purchaseOrderDeleteDescription: INodeProperties[] = deleteProperties(
	purchaseOrderInfo,
	'Deleting a purchase order is permanent. For order types with a financial effect, such as purchase invoices, myfactory also deletes the open item and the accounting transfer entry. myfactory refuses to delete a processed purchase order if its number range does not allow deleting or the user lacks the delete right. The API then reports only "Order could not be deleted" (status 409).',
);
