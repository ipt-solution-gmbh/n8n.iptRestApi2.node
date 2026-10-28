import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Product ID comes from get.ts. index.ts spreads this list after it, so Data appears below it.
export const productUpdateDescription: INodeProperties[] = [
	updateDataProperty('product', '{"Matchcode": "New name"}'),
];
