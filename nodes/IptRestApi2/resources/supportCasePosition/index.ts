import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { supportCasePositionCreateDescription } from './create';
import { supportCasePositionDeleteDescription } from './delete';
import { supportCasePositionGetDescription, supportCasePositionInfo } from './get';
import { supportCasePositionGetManyDescription } from './getAll';
import { supportCasePositionUpdateDescription } from './update';

export const supportCasePositionDescription: INodeProperties[] = [
	operationProperty(supportCasePositionInfo, {
		createDescription: 'Add a position to a support case',
	}),
	...supportCasePositionCreateDescription,
	...supportCasePositionDeleteDescription,
	...supportCasePositionGetDescription,
	...supportCasePositionGetManyDescription,
	...supportCasePositionUpdateDescription,
];
