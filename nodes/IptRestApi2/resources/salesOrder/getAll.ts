import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import { salesOrderGetManyIncludes, salesOrderInfo, salesOrderSimplifiedFields } from './get';

export const salesOrderGetManyDescription: INodeProperties[] = getManyProperties(
	salesOrderInfo,
	salesOrderSimplifiedFields,
	salesOrderGetManyIncludes,
	{
		fields: 'OrderID,OrderNumber,OrderSum',
		sort: '-BookingDate,OrderNumber',
		filterField: 'OrderType',
		clause: "BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'",
	},
);
