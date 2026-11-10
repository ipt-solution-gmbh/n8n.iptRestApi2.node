import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty, returnPositionsProperty } from '../../shared/write';

// The API rejects a new purchase order without OrderType and without a supplier (SupplierID or
// SupplierNumber). myfactory fills the other header fields from the supplier and the order type.
// Positions are part of the same request and optional. The API saves the new purchase order as
// processed and numbers its positions consecutively.
export const purchaseOrderCreateDescription: INodeProperties[] = [
	returnPositionsProperty('purchaseOrder'),
	...createDataProperty(
		'purchaseOrder',
		'Fields of the new purchase order as a JSON object. OrderType is required: the number of the purchase order type in myfactory, for example of an order or a goods receipt. The supplier is required as SupplierID or SupplierNumber. Positions go into the array Positions, each with ProductNumber or ProductID and Quantity. myfactory saves the purchase order as processed.',
		'{"OrderType": 1, "SupplierNumber": "70001", "Positions": [{"ProductNumber": "1000", "Quantity": 10}]}',
	),
];
