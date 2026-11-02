import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import { addressIncludes, addressInfo, addressSimplifiedFields } from './get';

export const addressGetManyDescription: INodeProperties[] = getManyProperties(
	addressInfo,
	addressSimplifiedFields,
	addressIncludes,
	{
		fields: 'AddressID,Matchcode,City',
		sort: '-ChangeDate,Matchcode',
		filterField: 'City',
		clause: "Name1 LIKE '$P100$Sample$P100$'",
	},
);
