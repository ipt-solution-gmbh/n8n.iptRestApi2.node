import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { purchaseOrderActionDescription, purchaseOrderActionOperations } from './actions';
import { purchaseOrderCreateDescription } from './create';
import { purchaseOrderDeleteDescription } from './delete';
import { purchaseOrderGetDescription, purchaseOrderInfo } from './get';
import { purchaseOrderGetManyDescription } from './getAll';
import { purchaseOrderUpdateDescription } from './update';

export const purchaseOrderDescription: INodeProperties[] = [
	operationProperty(
		purchaseOrderInfo,
		{
			createDescription: 'Create a new purchase order with its positions',
			getDescription: 'Get the data of a single purchase order with its positions',
		},
		purchaseOrderActionOperations,
	),
	...purchaseOrderCreateDescription,
	...purchaseOrderDeleteDescription,
	...purchaseOrderGetDescription,
	...purchaseOrderGetManyDescription,
	...purchaseOrderUpdateDescription,
	...purchaseOrderActionDescription,
];
