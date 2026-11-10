import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { supplierCreateDescription } from './create';
import { supplierDeleteDescription } from './delete';
import { supplierGetDescription, supplierInfo } from './get';
import { supplierGetManyDescription } from './getAll';
import { supplierUpdateDescription } from './update';

export const supplierDescription: INodeProperties[] = [
	operationProperty(supplierInfo, {
		createDescription: 'Create a new supplier for an existing address',
	}),
	...supplierCreateDescription,
	...supplierDeleteDescription,
	...supplierGetDescription,
	...supplierGetManyDescription,
	...supplierUpdateDescription,
];
