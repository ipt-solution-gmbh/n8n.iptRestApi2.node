import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { salesOrderPositionCreateDescription } from './create';
import { salesOrderPositionDeleteDescription } from './delete';
import { salesOrderPositionGetDescription, salesOrderPositionInfo } from './get';
import { salesOrderPositionGetManyDescription } from './getAll';
import { salesOrderPositionUpdateDescription } from './update';

export const salesOrderPositionDescription: INodeProperties[] = [
	operationProperty(salesOrderPositionInfo, {
		createDescription: 'Add a position to a sales order',
	}),
	...salesOrderPositionCreateDescription,
	...salesOrderPositionDeleteDescription,
	...salesOrderPositionGetDescription,
	...salesOrderPositionGetManyDescription,
	...salesOrderPositionUpdateDescription,
];
