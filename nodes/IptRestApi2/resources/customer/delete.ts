import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { customerInfo } from './get';

// myfactory deletes the customer row and its dependent data. Its delete rules refuse customers
// that are still in use and name the reason, which the API returns with status 409.
export const customerDeleteDescription: INodeProperties[] = deleteProperties(
	customerInfo,
	'Deleting a customer is permanent and also removes its dependent data in myfactory. myfactory refuses the delete while the customer is still used, for example in sales documents (also as invoice recipient), support cases, projects, accounting or contracts, or as template customer in web shop, country or branch settings. The node then fails with the reason (status 409).',
	'CustomerGroup',
);
