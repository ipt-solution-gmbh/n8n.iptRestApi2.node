import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Countries, the field Country of addresses. The key is a text, the country code of myfactory.
export const countryInfo: ResourceInfo = {
	resource: 'country',
	path: '/countries',
	label: 'country',
	labelPlural: 'countries',
	idParameter: 'countryId',
	idDisplayName: 'Country ID',
	idField: 'CountryID',
	textKeyExample: 'DE',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const countrySimplifiedFields = [
	'CountryID',
	'CountryDesc',
	'CountryISO2',
	'CountryISO3',
	'CountryNumber',
	'CountryPhonePrefix',
	'CountryGroup',
	'TaxEUCountry',
	'Webshop',
	'ExternalID',
];

export const countryDescription: INodeProperties[] = [
	operationProperty(countryInfo),
	...createDataProperty(
		'country',
		'Fields of the new country as a JSON object. CountryID (the key, up to 5 characters) and CountryDesc are required.',
		'{"CountryID": "NZ", "CountryDesc": "New Zealand"}',
	),
	...deleteProperties(
		countryInfo,
		'Deleting a country is permanent. myfactory refuses the delete while addresses use the country. The node then fails with the reason (status 409).',
	),
	...getProperties(countryInfo, countrySimplifiedFields, []),
	...getManyProperties(countryInfo, countrySimplifiedFields, [], {
		fields: 'CountryID,CountryDesc,CountryISO2',
		sort: 'CountryDesc',
		filterField: 'CountryGroup',
		clause: "CountryISO2 IN ('DE', 'AT', 'CH')",
	}),
	...updateDataProperty('country', '{"CountryPhonePrefix": "+64"}', textKeyUpdateNote(countryInfo)),
];
