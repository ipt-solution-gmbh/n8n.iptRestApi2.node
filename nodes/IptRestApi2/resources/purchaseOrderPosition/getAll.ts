import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import {
	purchaseOrderPositionIncludes,
	purchaseOrderPositionInfo,
	purchaseOrderPositionSimplifiedFields,
} from './get';

// The positions of one purchase order come from the filter OrderID
export const purchaseOrderPositionGetManyDescription: INodeProperties[] = getManyProperties(
	purchaseOrderPositionInfo,
	purchaseOrderPositionSimplifiedFields,
	purchaseOrderPositionIncludes,
	{
		fields: 'OrderPosID,OrderID,ProductNumber,Quantity',
		sort: 'OrderID,PosNumber',
		filterField: 'OrderID',
		clause: "ProductNumber$EQ$'1000'",
	},
);
