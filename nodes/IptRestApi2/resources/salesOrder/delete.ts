import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { salesOrderInfo } from './get';

// The sales orders endpoint deletes only one order by ID, so there is no Delete Multiple. When
// myfactory refuses, the API drops the reason and answers only "Order could not be deleted".
export const salesOrderDeleteDescription: INodeProperties[] = deleteProperties(
	salesOrderInfo,
	'Deleting a sales order is permanent. myfactory refuses it for a processed sales order if its number range does not allow deleting or the user lacks the delete right, and for a sales order that is the template of a contract or is linked to time billing or a time quota. The API then reports only "Order could not be deleted" (status 409).',
);
