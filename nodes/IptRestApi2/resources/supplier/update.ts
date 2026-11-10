import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Supplier ID comes from get.ts. index.ts spreads this list after it, so Data appears below it.
export const supplierUpdateDescription: INodeProperties[] = [
	...updateDataProperty('supplier', '{"MinOrderValue": 250, "DefaultDiscount": 2}'),
];
