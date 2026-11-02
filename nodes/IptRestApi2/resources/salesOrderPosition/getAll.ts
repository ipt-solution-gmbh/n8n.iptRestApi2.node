import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import {
	salesOrderPositionIncludes,
	salesOrderPositionInfo,
	salesOrderPositionSimplifiedFields,
} from './get';

// The positions of one sales order come from the filter OrderID
export const salesOrderPositionGetManyDescription: INodeProperties[] = getManyProperties(
	salesOrderPositionInfo,
	salesOrderPositionSimplifiedFields,
	salesOrderPositionIncludes,
	{
		fields: 'OrderPosID,OrderID,ProductNumber,Quantity',
		sort: 'OrderID,PosNumber',
		filterField: 'OrderID',
		clause: "ProductNumber$EQ$'1000'",
	},
);
