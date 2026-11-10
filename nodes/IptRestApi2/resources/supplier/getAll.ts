import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import { supplierIncludes, supplierInfo, supplierSimplifiedFields } from './get';

export const supplierGetManyDescription: INodeProperties[] = getManyProperties(
	supplierInfo,
	supplierSimplifiedFields,
	supplierIncludes,
	{
		fields: 'SupplierID,SupplierNumber,AddressID',
		sort: '-ChangeDate,SupplierNumber',
		filterField: 'SupplierGroup',
		clause: "ChangeDate$GT$$EQ$'20261001'",
	},
);
