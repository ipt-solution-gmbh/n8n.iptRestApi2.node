import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import {
	purchaseOrderGetManyIncludes,
	purchaseOrderInfo,
	purchaseOrderSimplifiedFields,
} from './get';

export const purchaseOrderGetManyDescription: INodeProperties[] = getManyProperties(
	purchaseOrderInfo,
	purchaseOrderSimplifiedFields,
	purchaseOrderGetManyIncludes,
	{
		fields: 'OrderID,OrderNumber,OrderSum',
		sort: '-BookingDate,OrderNumber',
		filterField: 'SupplierID',
		clause: "BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'",
	},
);
