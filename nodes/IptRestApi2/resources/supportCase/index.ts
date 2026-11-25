import type { INodeProperties } from 'n8n-workflow';
import { operationProperty } from '../../shared/operations';
import { supportCaseCreateDescription } from './create';
import { supportCaseDeleteDescription } from './delete';
import { supportCaseGetDescription, supportCaseInfo } from './get';
import { supportCaseGetManyDescription } from './getAll';
import { supportCaseUpdateDescription } from './update';

export const supportCaseDescription: INodeProperties[] = [
	operationProperty(supportCaseInfo),
	...supportCaseCreateDescription,
	...supportCaseDeleteDescription,
	...supportCaseGetDescription,
	...supportCaseGetManyDescription,
	...supportCaseUpdateDescription,
];
