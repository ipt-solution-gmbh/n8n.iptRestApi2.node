import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import { productIncludes, productInfo, productSimplifiedFields } from './get';

export const productGetManyDescription: INodeProperties[] = getManyProperties(
	productInfo,
	productSimplifiedFields,
	productIncludes,
	{
		fields: 'ProductID,ProductNumber,Matchcode',
		sort: '-ChangeDate,Matchcode',
		filterField: 'ProductGroup',
		clause: "Matchcode LIKE '$P100$Hammer$P100$'",
	},
);
