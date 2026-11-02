import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// The API requires Name1 and Matchcode and rejects a new address if one with the same Name1 and
// Matchcode exists. AddressNumber comes from the number range of myfactory when it is missing.
// Without Country and Language the API takes the defaults of the myfactory installation.
export const addressCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'address',
		'Fields of the new address as a JSON object. Name1 and Matchcode are required. An address with the same Name1 and Matchcode is rejected as a duplicate. Without AddressNumber, myfactory assigns the next number.',
		'{"Matchcode": "SAMPLE", "Name1": "Sample Ltd"}',
	),
];
