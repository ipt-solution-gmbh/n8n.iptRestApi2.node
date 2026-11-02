import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { productCreateDescription } from './create';
import { productDeleteDescription } from './delete';
import { productGetDescription, productInfo } from './get';
import { productGetManyDescription } from './getAll';
import { productUpdateDescription } from './update';

export const productDescription: INodeProperties[] = [
	operationProperty(productInfo),
	...productCreateDescription,
	...productDeleteDescription,
	...productGetDescription,
	...productGetManyDescription,
	...productUpdateDescription,
];
