import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, textKeyUpdateNote, updateDataProperty } from '../../shared/write';

// Contract types, the field ContractTypeName of contracts. Generate Orders selects the contracts
// by these names. The key is a text.
export const salesOrderContractTypeInfo: ResourceInfo = {
	resource: 'salesOrderContractType',
	path: '/salesordercontracttypes',
	label: 'sales order contract type',
	labelPlural: 'sales order contract types',
	idParameter: 'salesOrderContractTypeName',
	idDisplayName: 'Sales Order Contract Type Name',
	idField: 'ContractTypeName',
	textKeyExample: 'SERVICE',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const salesOrderContractTypeSimplifiedFields = ['ContractTypeName', 'ContractTypeDesc'];

export const salesOrderContractTypeDescription: INodeProperties[] = [
	operationProperty(salesOrderContractTypeInfo),
	...createDataProperty(
		'salesOrderContractType',
		'Fields of the new contract type as a JSON object. ContractTypeName (the key, up to 10 characters) and ContractTypeDesc are required.',
		'{"ContractTypeName": "SERVICE", "ContractTypeDesc": "Service contracts"}',
	),
	...deleteProperties(
		salesOrderContractTypeInfo,
		'Deleting a contract type is permanent. From ipt RestApi2 58.6.1 on, the API answers with status 409 while contracts still use the type. Older versions do not check this and delete it anyway, those contracts then refer to a contract type that no longer exists. There, check with Sales Order Contract > Get Many and the filter ContractTypeName first.',
	),
	...getProperties(salesOrderContractTypeInfo, salesOrderContractTypeSimplifiedFields, []),
	...getManyProperties(salesOrderContractTypeInfo, salesOrderContractTypeSimplifiedFields, [], {
		fields: 'ContractTypeName,ContractTypeDesc',
		sort: 'ContractTypeName',
		filterField: 'ContractTypeDesc',
		clause: "ContractTypeDesc LIKE '$P100$service$P100$'",
	}),
	...updateDataProperty(
		'salesOrderContractType',
		'{"ContractTypeDesc": "Service and maintenance contracts"}',
		textKeyUpdateNote(salesOrderContractTypeInfo),
	),
];
