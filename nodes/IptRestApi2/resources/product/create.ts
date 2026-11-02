import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// tdProducts needs these columns. If the access point has a template product, the API takes
// every missing field except ProductID and ProductNumber from it. ProductNumber comes from the
// number range of myfactory when it is missing. The API rejects a product group that does not
// exist in myfactory.
export const productCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'product',
		'Fields of the new product as a JSON object. Without a template product for the access point, Matchcode, BaseUnit, BaseDecimals and ProductGroup are required. BaseUnit and ProductGroup must exist in myfactory. Without ProductNumber, myfactory assigns the next number.',
		'{"Matchcode": "Sample product", "BaseUnit": "Stk", "BaseDecimals": 0, "ProductGroup": "Allg."}',
	),
];
