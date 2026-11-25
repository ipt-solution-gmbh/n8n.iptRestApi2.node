import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { addressInfo } from './get';

// myfactory deletes the address and its dependent data. It refuses the delete while the address is
// still used, the API returns that with status 409 and the reason.
export const addressDeleteDescription: INodeProperties[] = deleteProperties(
	addressInfo,
	'Deleting an address is permanent and also removes its dependent data in myfactory. myfactory refuses the delete while the address is still used, for example as customer, supplier, prospect, representative, employee or delivery address. The node then fails with the reason (status 409).',
	'AddressGroup',
);
