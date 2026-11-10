import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// The API needs the sales order and, for a product position, the product. It fills the other
// required columns itself and recalculates the sales order.
export const salesOrderPositionCreateDescription: INodeProperties[] = [
	{
		displayName:
			'myfactory adds the position and recalculates the sales order, but does not number the positions again. Use the sales order action Renumber Positions for that.',
		name: 'salesOrderPositionCreateNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['salesOrderPosition'],
				operation: ['create'],
			},
		},
		default: '',
	},
	...createDataProperty(
		'salesOrderPosition',
		'Fields of the new position as a JSON object. OrderID is required: the ID of the sales order. PosType: 1 product (default, needs ProductID or ProductNumber), 2 manual position (send Name1, Quantity, Unit and Price), 3 alternative position (offers only), 4 text (Name1 up to 100 characters, long text in PosText), 5 subtotal, 6 page break, 7 group title. Other values are rejected. PosIndex inserts the position before the position at that place (0 is the first), without it the position is appended. For a product position, a sent Price or Discount wins over the price lists and the position is marked as a manual price (PriceManual 0 turns this off). The sales order action Refresh Prices keeps it only if myfactory is set up to keep fixed prices. Without PosNumber the new position gets the number of its predecessor plus one. myfactory recalculates the sales order.',
		'{"OrderID": 1234, "ProductNumber": "1000", "Quantity": 2}',
		'Whether to return almost all fields of the new position instead of a few fields only. Some fields such as OrderID are missing from the response. Use Get to read them.',
	),
];
