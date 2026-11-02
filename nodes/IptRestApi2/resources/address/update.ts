import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Address ID comes from get.ts. index.ts spreads this list after it, so Data appears below it.
export const addressUpdateDescription: INodeProperties[] = [
	...updateDataProperty('address', '{"Street": "New Street 2", "City": "Sample City"}'),
];
