import type { INodeProperties } from 'n8n-workflow';
import { createDataProperty } from '../../shared/write';

// The API requires CaseID, PosType and PosDesc, assigns PosID and CreationUser itself and rejects
// them in the body. myfactory sets date, due date and user and marks the support case as changed. PosType is the ID of an
// action type of the installation (table tdSupportCasePosTypes).
export const supportCasePositionCreateDescription: INodeProperties[] = [
	...createDataProperty(
		'supportCasePosition',
		'Fields of the new position as a JSON object. CaseID (the ID of the support case), PosType and PosDesc (short description, up to 150 characters) are required. PosType is the ID of an action type of your installation, listed in the table tdSupportCasePosTypes (resource Table Data). PosComment holds the long text. myfactory sets the date and the user and marks the support case as changed. PosID and CreationUser are assigned by myfactory and must not be sent.',
		'{"CaseID": 1234, "PosType": 6, "PosDesc": "Called the customer"}',
	),
];
