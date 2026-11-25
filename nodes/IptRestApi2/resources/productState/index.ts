import type { INodeProperties } from 'n8n-workflow';
import { deleteProperties } from '../../shared/delete';
import { operationProperty } from '../../shared/operations';
import { changedSinceOption, getManyProperties, getProperties } from '../../shared/read';
import type { ResourceInfo } from '../../shared/resource';
import { createDataProperty, updateDataProperty } from '../../shared/write';

// Product states, the field ProductState of products. A state can lock products for sales,
// delivery, purchase, production or the web portal.
export const productStateInfo: ResourceInfo = {
	resource: 'productState',
	path: '/productstates',
	label: 'product state',
	labelPlural: 'product states',
	idParameter: 'productStateId',
	idDisplayName: 'Product State ID',
	idField: 'StateID',
};

// Fields returned when Simplify is on. Get and Get Many use the same list.
const productStateSimplifiedFields = [
	'StateID',
	'StateDesc',
	'SalesOfferLock',
	'SalesOrderLock',
	'SalesDeliveryLock',
	'PurchaseOrderLock',
	'PPSLock',
	'WebPortalLock',
	'WarningAvailableStock',
	'ChangeDate',
];

// The only one of the lists with ChangeDate and CreationDate, so the only one with Changed Since
export const productStateDescription: INodeProperties[] = [
	operationProperty(productStateInfo),
	...createDataProperty(
		'productState',
		'Fields of the new product state as a JSON object. StateDesc is required. The API assigns StateID.',
		'{"StateDesc": "Discontinued"}',
	),
	...deleteProperties(
		productStateInfo,
		'Deleting a product state is permanent. myfactory refuses the delete while products have this state. The node then fails with the reason (status 409).',
	),
	...getProperties(productStateInfo, productStateSimplifiedFields, []),
	...getManyProperties(
		productStateInfo,
		productStateSimplifiedFields,
		[],
		{
			fields: 'StateID,StateDesc,SalesOrderLock',
			sort: 'StateID',
			filterField: 'SalesOrderLock',
			clause: 'SalesOrderLock$NE$0',
		},
		[changedSinceOption],
	),
	...updateDataProperty('productState', '{"StateDesc": "Discontinued"}'),
];
