import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { customerCreateDescription } from './create';
import { customerDeleteDescription } from './delete';
import { customerGetDescription, customerInfo } from './get';
import { customerGetManyDescription } from './getAll';
import { customerUpdateDescription } from './update';

export const customerDescription: INodeProperties[] = [
	operationProperty(customerInfo, {
		createDescription: 'Create a new customer for an existing address',
	}),
	...customerCreateDescription,
	...customerDeleteDescription,
	...customerGetDescription,
	...customerGetManyDescription,
	...customerUpdateDescription,
];
