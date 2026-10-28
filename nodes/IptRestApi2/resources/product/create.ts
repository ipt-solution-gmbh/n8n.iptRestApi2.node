import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// tdProducts needs these columns. If the access point has a template product, the API takes
// every missing field except ProductID and ProductNumber from it. ProductNumber comes from the
// number range of myfactory when it is missing.
export const productCreateDescription: INodeProperties[] = [
	createDataProperty(
		'product',
		'Fields of the new product as a JSON object. Without a template product for the access point, Matchcode, BaseUnit, BaseDecimals and ProductGroup are required. Without ProductNumber, myfactory assigns the next number.',
		'{"Matchcode": "Sample product", "BaseUnit": "pcs", "BaseDecimals": 0, "ProductGroup": "Default"}',
	),
];
