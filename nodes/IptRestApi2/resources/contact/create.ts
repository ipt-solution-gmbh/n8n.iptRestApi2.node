import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// A contact requires AddressID and Matchcode, the API assigns ContactID. The API rejects an
// AddressID or Country that does not exist in myfactory. Contacts have no number range, so
// ContactNumber stays empty unless it is sent.
export const contactCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'contact',
		'Fields of the new contact as a JSON object. AddressID (the address the contact belongs to) and Matchcode are required. The address must exist in myfactory. ContactNumber is not assigned automatically.',
		'{"AddressID": 1234, "Matchcode": "SMITH"}',
	),
];
