import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { salesOrderActionDescription, salesOrderActionOperations } from './actions';
import { salesOrderCreateDescription } from './create';
import { salesOrderDeleteDescription } from './delete';
import { salesOrderGetDescription, salesOrderInfo } from './get';
import { salesOrderGetManyDescription } from './getAll';
import { salesOrderUpdateDescription } from './update';

export const salesOrderDescription: INodeProperties[] = [
	operationProperty(
		salesOrderInfo,
		{
			createDescription: 'Create a new sales order with its positions',
			getDescription: 'Get the data of a single sales order with its positions',
		},
		salesOrderActionOperations,
	),
	...salesOrderCreateDescription,
	...salesOrderDeleteDescription,
	...salesOrderGetDescription,
	...salesOrderGetManyDescription,
	...salesOrderUpdateDescription,
	...salesOrderActionDescription,
];
