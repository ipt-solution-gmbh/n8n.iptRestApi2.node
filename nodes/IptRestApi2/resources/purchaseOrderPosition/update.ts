import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Purchase Order Position ID comes from get.ts. index.ts spreads this list after it, so Data
// appears below it. The API refuses to move a position to another order or to change its type,
// and leaves the fields of the delivery date confirmation to the purchase order action.
export const purchaseOrderPositionUpdateDescription: INodeProperties[] = [
	...updateDataProperty(
		'purchaseOrderPosition',
		'{"Quantity": 12, "DeliveryDate": "2026-10-15"}',
		'OrderID and PosType cannot be changed. PosIndex moves the position to that place in the purchase order (0 is the first), the position numbers stay the same. The fields DeliveryRequestDate, DeliveryReminderDate, DeliveryDateConfirmationText and CountDeliveryDateChange are ignored, use the purchase order action Confirm Delivery Dates. myfactory recalculates the purchase order.',
	),
];
