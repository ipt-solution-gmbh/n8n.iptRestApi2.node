import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Currencies, for example the field CurrencyUnit of customers. The key is a text.
export const currencyInfo: ResourceInfo = {
	resource: 'currency',
	path: '/currencies',
	label: 'currency',
	labelPlural: 'currencies',
	idParameter: 'currencyUnit',
	idDisplayName: 'Currency Unit',
	idField: 'CurrUnit',
	textKeyExample: 'EUR',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const currencySimplifiedFields = ['CurrUnit', 'CurrSign', 'CurrDesc', 'CurrDecimals', 'CurrRound'];

export const currencyDescription: INodeProperties[] = [
	operationProperty(currencyInfo),
	...createDataProperty(
		'currency',
		'Fields of the new currency as a JSON object. CurrUnit (the key, up to 3 characters), CurrSign and CurrDesc are required.',
		'{"CurrUnit": "NZD", "CurrSign": "NZ$", "CurrDesc": "New Zealand dollar"}',
	),
	...deleteProperties(
		currencyInfo,
		'Deleting a currency is permanent and also removes its exchange rates in myfactory. myfactory refuses the delete while the currency is used, for example by customers, sales or purchase documents or bookings. The node then fails with the reason (status 409).',
	),
	...getProperties(currencyInfo, currencySimplifiedFields, []),
	...getManyProperties(currencyInfo, currencySimplifiedFields, [], {
		fields: 'CurrUnit,CurrDesc',
		sort: 'CurrUnit',
		filterField: 'CurrDecimals',
		clause: "CurrUnit IN ('EUR', 'USD')",
	}),
	...updateDataProperty('currency', '{"CurrDesc": "Euro"}', textKeyUpdateNote(currencyInfo)),
];
