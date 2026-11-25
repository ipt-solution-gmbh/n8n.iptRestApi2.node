import type { INodeProperties } from 'n8n-workflow';
import { changedSinceOption, getManyProperties } from '../../shared/read';
import { supportCaseInfo, supportCaseSimplifiedFields } from './get';

export const supportCaseGetManyDescription: INodeProperties[] = getManyProperties(
	supportCaseInfo,
	supportCaseSimplifiedFields,
	[],
	{
		fields: 'CaseID,CaseNumber,CaseDesc,CaseState',
		sort: '-CreationDate',
		filterField: 'AddressID',
		clause: "CreationDate$GT$$EQ$'20261001'",
	},
	[changedSinceOption],
);
