import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { contactInfo } from './get';

// myfactory deletes the contact with its attribute values, newsletter entries, portal account and
// references. myfactory refuses the delete while the contact is still used, the API returns that
// with status 409 and the reason. Delete takes one ID only.
export const contactDeleteDescription: INodeProperties[] = deleteProperties(
	contactInfo,
	'Deleting a contact is permanent and also removes its attribute values, newsletter entries and portal account in myfactory. myfactory refuses the delete while the contact is still used, for example as document recipient, in sales or purchase documents, in sales contacts or in support cases. The node then fails with the reason (status 409).',
);
