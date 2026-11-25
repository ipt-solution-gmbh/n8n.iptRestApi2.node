import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { customerInfo } from './get';

// myfactory deletes the customer and its dependent data. It refuses the delete while the customer
// is still used, the API returns that with status 409 and the reason.
export const customerDeleteDescription: INodeProperties[] = deleteProperties(
	customerInfo,
	"Deleting a customer is permanent and also removes its dependent data in myfactory. myfactory refuses the delete while the customer is still used, for example in sales documents (also as invoice recipient), support cases, projects, accounting or contracts, or as template customer in web shop, country or branch settings. The node then fails with the reason (status 409). If the myfactory setting to delete unused addresses is on, the customer's address is deleted too, unless another record such as a supplier or prospect still uses it.",
	'CustomerGroup',
);
