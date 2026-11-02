import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// A customer belongs to an existing address and the API rejects a new customer without
// AddressID. CustomerNumber comes from the number range of myfactory when it is missing. Without
// CustomerGroup the API takes the first group in alphabetical order, without CurrencyUnit the
// internal currency.
export const customerCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'customer',
		'Fields of the new customer as a JSON object. AddressID is required: create the address first (resource Address) and use the AddressID it returns. Without CustomerNumber, myfactory assigns the next number.',
		'{"AddressID": 1234}',
	),
];
