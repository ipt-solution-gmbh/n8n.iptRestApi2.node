import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// A supplier belongs to an existing address and the API rejects a new supplier without AddressID
// or SupplierGroup. An empty SupplierGroup passes that check, and the API then takes the first
// group in alphabetical order. SupplierNumber comes from the number range of myfactory when it is
// missing, CurrencyUnit defaults to the internal currency. A purchase order takes the payment
// condition of the supplier or of its supplier group and cannot be saved without one.
export const supplierCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'supplier',
		'Fields of the new supplier as a JSON object. AddressID is required: create the address first (resource Address) and use the AddressID it returns. SupplierGroup is required: the short name of a supplier group of your installation, not its description. An empty text takes the first group in alphabetical order. Without SupplierNumber, myfactory assigns the next number. A purchase order needs a payment condition: set PaymentConditions to the ConditionID of a payment condition of your installation, otherwise myfactory takes the one of the supplier group or its parent groups. Without either, creating a purchase order for the supplier fails.',
		'{"AddressID": 1234, "SupplierGroup": "HL", "PaymentConditions": 1}',
	),
];
