import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Customer ID comes from get.ts. index.ts spreads this list after it, so Data appears below it.
export const customerUpdateDescription: INodeProperties[] = [
	...updateDataProperty('customer', '{"CreditLimit": 5000, "Discount": 2}'),
];
