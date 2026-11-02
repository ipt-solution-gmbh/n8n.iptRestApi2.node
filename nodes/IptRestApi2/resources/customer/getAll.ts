import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import { customerIncludes, customerInfo, customerSimplifiedFields } from './get';

export const customerGetManyDescription: INodeProperties[] = getManyProperties(
	customerInfo,
	customerSimplifiedFields,
	customerIncludes,
	{
		fields: 'CustomerID,CustomerNumber,AddressID',
		sort: '-ChangeDate,CustomerNumber',
		filterField: 'CustomerGroup',
		clause: "ChangeDate$GT$$EQ$'20261001'",
	},
);
