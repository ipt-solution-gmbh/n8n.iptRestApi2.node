import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { productInfo } from './get';

// myfactory deletes the product and its dependent data. It refuses the delete while the product is
// still used, the API returns that with status 409 and the reason.
export const productDeleteDescription: INodeProperties[] = deleteProperties(
	productInfo,
	'Deleting a product is permanent and also removes its dependent data in myfactory. If the product is still in use, for example in sales or purchase documents, bills of materials, production orders or bookings, myfactory refuses the delete and the node fails with the reason (status 409).',
	'ProductGroup',
);
