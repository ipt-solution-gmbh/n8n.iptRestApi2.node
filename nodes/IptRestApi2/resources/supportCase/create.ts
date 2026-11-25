import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// The API assigns CaseID and CaseNumber and presets date, taking user, state, priority, category, source,
// department and handling user from the support defaults. Saving requires an address. Without
// CaseDesc myfactory sets a placeholder, and saving a changed case is refused as long as the
// placeholder stays. The API checks ContactID against the address and HandlingUser against the
// myfactory users. It answers with the sent fields, CaseID and CaseNumber, also with alldata.
export const supportCaseCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'supportCase',
		'Fields of the new support case as a JSON object. AddressID is required. Send CaseDesc too (short description, up to 100 characters): without it myfactory sets a placeholder text, and Update fails until CaseDesc is changed. myfactory assigns CaseNumber and presets state, priority and handling user from its support settings. ContactID must be a contact of the address and HandlingUser the short name of a myfactory user, otherwise the API answers with status 400. Depending on the support settings, SupportDepartment or HandlingUser can be required too.',
		'{"AddressID": 1234, "CaseDesc": "Printer does not start"}',
		'Whether to ask for all fields of the new support case. The API returns only the sent fields, CaseID and CaseNumber either way. Use Get to read all fields.',
	),
];
