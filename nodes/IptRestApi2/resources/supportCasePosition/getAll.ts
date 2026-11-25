import type { INodeProperties } from 'n8n-workflow';
import { getManyProperties } from '../../shared/read';
import {
	supportCasePositionIncludes,
	supportCasePositionInfo,
	supportCasePositionSimplifiedFields,
} from './get';

// The positions of one support case come from the filter CaseID
export const supportCasePositionGetManyDescription: INodeProperties[] = getManyProperties(
	supportCasePositionInfo,
	supportCasePositionSimplifiedFields,
	supportCasePositionIncludes,
	{
		fields: 'PosID,CaseID,PosDate,PosDesc',
		sort: 'CaseID,PosDate',
		filterField: 'CaseID',
		clause: "PosDate$GT$$EQ$'20261001'",
	},
);
