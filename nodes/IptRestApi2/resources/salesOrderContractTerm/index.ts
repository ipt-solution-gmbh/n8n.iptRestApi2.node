import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Contract terms, the period between two orders of an order plan entry (field ContractTermID)
export const salesOrderContractTermInfo: ResourceInfo = {
	resource: 'salesOrderContractTerm',
	path: '/salesordercontractterms',
	label: 'sales order contract term',
	labelPlural: 'sales order contract terms',
	idParameter: 'salesOrderContractTermId',
	idDisplayName: 'Sales Order Contract Term ID',
	idField: 'TermID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list. Every field of a term
// is a base field.
const salesOrderContractTermSimplifiedFields = [
	'TermID',
	'TermDesc',
	'IntervallValue',
	'IntervallType',
	'StandardIntervall',
	'SplitOrders',
];

export const salesOrderContractTermDescription: INodeProperties[] = [
	operationProperty(salesOrderContractTermInfo),
	...createDataProperty(
		'salesOrderContractTerm',
		'Fields of the new term as a JSON object. TermDesc is required, the API assigns TermID. The period is IntervallValue units of IntervallType: 0 days, 1 weeks, 2 months, 3 quarters, 4 half years, 5 years. Without them both are 0.',
		'{"TermDesc": "Monthly", "IntervallValue": 1, "IntervallType": 2}',
	),
	...deleteProperties(
		salesOrderContractTermInfo,
		'Deleting a term is permanent. From ipt RestApi2 58.6.1 on, the API answers with status 409 while order plan entries of contracts still use the term. Older versions do not check this and delete it anyway, Generate Orders then creates no orders for those entries. There, check with Sales Order Contract Order > Get Many and the filter ContractTermID first.',
	),
	...getProperties(salesOrderContractTermInfo, salesOrderContractTermSimplifiedFields, []),
	...getManyProperties(salesOrderContractTermInfo, salesOrderContractTermSimplifiedFields, [], {
		fields: 'TermID,TermDesc',
		sort: 'TermDesc',
		filterField: 'IntervallType',
		clause: 'IntervallValue$GT$1',
	}),
	...updateDataProperty('salesOrderContractTerm', '{"TermDesc": "Every month"}'),
];
