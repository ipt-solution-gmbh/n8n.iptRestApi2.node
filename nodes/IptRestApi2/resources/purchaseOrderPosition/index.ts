import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { purchaseOrderPositionCreateDescription } from './create';
import { purchaseOrderPositionDeleteDescription } from './delete';
import { purchaseOrderPositionGetDescription, purchaseOrderPositionInfo } from './get';
import { purchaseOrderPositionGetManyDescription } from './getAll';
import { purchaseOrderPositionUpdateDescription } from './update';

export const purchaseOrderPositionDescription: INodeProperties[] = [
	operationProperty(purchaseOrderPositionInfo, {
		createDescription: 'Add a position to a purchase order',
	}),
	...purchaseOrderPositionCreateDescription,
	...purchaseOrderPositionDeleteDescription,
	...purchaseOrderPositionGetDescription,
	...purchaseOrderPositionGetManyDescription,
	...purchaseOrderPositionUpdateDescription,
];
