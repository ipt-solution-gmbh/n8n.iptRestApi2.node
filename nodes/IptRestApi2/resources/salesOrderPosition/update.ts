import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Sales Order Position ID comes from get.ts. index.ts spreads this list after it, so Data appears
// below it. The API refuses to move a position to another order or to change its type.
export const salesOrderPositionUpdateDescription: INodeProperties[] = [
	...updateDataProperty(
		'salesOrderPosition',
		'{"Quantity": 3}',
		'OrderID and PosType cannot be changed. PosIndex moves the position to that place in the sales order (0 is the first), the position numbers stay the same. myfactory recalculates the sales order.',
	),
];
