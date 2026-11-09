import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// The API rejects a new sales order without OrderType and without a customer (CustomerID or
// CustomerNumber). myfactory fills the other header fields from the customer and the order type.
// Positions are part of the same request and optional.
export const salesOrderCreateDescription: INodeProperties[] = [
	// Without query parameters the API answers a create like a list request: only the base
	// fields and no positions. positions is always sent, so the response always has the
	// positions. All Data (alldata) adds the remaining header fields. The API checks only that
	// the parameters are present.
	{
		displayName: 'Return Positions',
		name: 'salesOrderCreateQuery',
		type: 'hidden',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
		default: '',
		routing: {
			request: {
				qs: {
					positions: 'true',
				},
			},
		},
	},
	...createDataProperty(
		'salesOrder',
		'Fields of the new sales order as a JSON object. OrderType is required: the number of the order type in myfactory, for example of an order confirmation or an invoice. The customer is required as CustomerID or CustomerNumber. Positions go into the array Positions, each with ProductNumber or ProductID and Quantity.',
		'{"OrderType": 2, "CustomerNumber": "10001", "Positions": [{"ProductNumber": "1000", "Quantity": 2}]}',
	),
];
