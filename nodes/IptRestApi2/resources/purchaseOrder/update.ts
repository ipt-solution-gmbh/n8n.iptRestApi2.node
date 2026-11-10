import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Purchase Order ID comes from get.ts. index.ts spreads this list after it, so Data appears below
// it. The API changes only positions that name their OrderPosID and skips the others.
export const purchaseOrderUpdateDescription: INodeProperties[] = [
	...updateDataProperty(
		'purchaseOrder',
		'{"ReferenceText": "Order 4711", "Positions": [{"OrderPosID": 5678, "Quantity": 3}]}',
		'Positions in the array Positions change existing positions and need their OrderPosID. Positions without OrderPosID are ignored.',
	),
];
