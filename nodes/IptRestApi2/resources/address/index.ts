import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { addressCreateDescription } from './create';
import { addressDeleteDescription } from './delete';
import { addressGetDescription, addressInfo } from './get';
import { addressGetManyDescription } from './getAll';
import { addressUpdateDescription } from './update';

export const addressDescription: INodeProperties[] = [
	operationProperty(addressInfo),
	...addressCreateDescription,
	...addressDeleteDescription,
	...addressGetDescription,
	...addressGetManyDescription,
	...addressUpdateDescription,
];
