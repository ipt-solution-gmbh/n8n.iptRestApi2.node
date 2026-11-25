import type { INodeProperties } from 'n8n-workflow';
import { changedSinceOption, getManyProperties } from '../../shared/read';
import { contactIncludes, contactInfo, contactSimplifiedFields } from './get';

// The contacts of one address come from the filter AddressID
export const contactGetManyDescription: INodeProperties[] = getManyProperties(
	contactInfo,
	contactSimplifiedFields,
	contactIncludes,
	{
		fields: 'ContactID,AddressID,LastName,EMail',
		sort: 'AddressID,Matchcode',
		filterField: 'AddressID',
		clause: "EMail LIKE '$P100$@example.com'",
	},
	[changedSinceOption],
);
