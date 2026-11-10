import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

// Names of a resource as they appear in node parameters, texts and API fields
export interface ResourceInfo {
	// Value of the Resource parameter, for example "salesOrder"
	resource: string;
	// API path of the endpoint, for example "/salesorders"
	path: string;
	// Name of one record in texts, for example "sales order"
	label: string;
	// Name of several records in texts, for example "sales orders"
	labelPlural: string;
	// Parameter that holds the record ID, for example "salesOrderId"
	idParameter: string;
	// Display name of that parameter, for example "Sales Order ID"
	idDisplayName: string;
	// Primary key field in the API, for example "OrderID"
	idField: string;
}

// The ID parameter of a record. Several operations share the parameter name, each resource
// defines it once for Get and Update and once for Delete.
export function idProperty(
	info: ResourceInfo,
	show: NonNullable<IDisplayOptions['show']>,
): INodeProperties {
	return {
		displayName: info.idDisplayName,
		name: info.idParameter,
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [info.resource],
				...show,
			},
		},
		default: '',
		placeholder: '1234',
		description: `Numeric ID of the ${info.label} (field ${info.idField})`,
	};
}
