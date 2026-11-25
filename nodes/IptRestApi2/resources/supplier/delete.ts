import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { supplierInfo } from './get';

// myfactory deletes the supplier and its dependent data. It refuses the delete while the supplier
// is still used, the API returns that with status 409 and the reason.
export const supplierDeleteDescription: INodeProperties[] = deleteProperties(
	supplierInfo,
	"Deleting a supplier is permanent and also removes its bank details and product supplier entries in myfactory. myfactory refuses the delete while the supplier is used in purchase documents, in accounting or for devices. The node then fails with the reason (status 409). If the myfactory setting to delete unused addresses is on, the supplier's address is deleted too, unless another record such as a customer or prospect still uses it.",
	'SupplierGroup',
);
