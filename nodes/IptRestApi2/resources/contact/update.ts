import type { INodeProperties } from 'n8n-workflow';
import { updateDataProperty } from '../../shared/write';

// Contact ID comes from get.ts. index.ts spreads this list after it, so Data appears below it.
export const contactUpdateDescription: INodeProperties[] = [
	...updateDataProperty('contact', '{"EMail": "john.smith@example.com", "PhoneNr": "+1 555 0100"}'),
];
