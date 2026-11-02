import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { productInfo } from './get';

// myfactory deletes the product row and its dependent data. Its delete rules refuse products
// that are still in use and name the reason, which the API returns with status 409.
export const productDeleteDescription: INodeProperties[] = deleteProperties(
	productInfo,
	'Deleting a product is permanent and also removes its dependent data in myfactory. If the product is still in use, for example in sales or purchase documents, bills of materials, production orders or bookings, myfactory refuses the delete and the node fails with the reason (status 409).',
	'ProductGroup',
);
