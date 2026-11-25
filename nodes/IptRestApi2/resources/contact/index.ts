import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { contactCreateDescription } from './create';
import { contactDeleteDescription } from './delete';
import { contactGetDescription, contactInfo } from './get';
import { contactGetManyDescription } from './getAll';
import { contactUpdateDescription } from './update';

export const contactDescription: INodeProperties[] = [
	operationProperty(contactInfo, {
		createDescription: 'Add a contact to an address',
	}),
	...contactCreateDescription,
	...contactDeleteDescription,
	...contactGetDescription,
	...contactGetManyDescription,
	...contactUpdateDescription,
];
