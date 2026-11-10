import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { addressDescription } from './resources/address';
import { addressInfo } from './resources/address/get';
import { customerDescription } from './resources/customer';
import { customerInfo } from './resources/customer/get';
import { productDescription } from './resources/product';
import { productInfo } from './resources/product/get';
import { purchaseOrderDescription } from './resources/purchaseOrder';
import { purchaseOrderInfo } from './resources/purchaseOrder/get';
import { purchaseOrderPositionDescription } from './resources/purchaseOrderPosition';
import { purchaseOrderPositionInfo } from './resources/purchaseOrderPosition/get';
import { salesOrderDescription } from './resources/salesOrder';
import { salesOrderInfo } from './resources/salesOrder/get';
import { salesOrderPositionDescription } from './resources/salesOrderPosition';
import { salesOrderPositionInfo } from './resources/salesOrderPosition/get';
import { supplierDescription } from './resources/supplier';
import { supplierInfo } from './resources/supplier/get';
import { tableDataDescription } from './resources/tableData';
import { writeFieldsLoader } from './shared/write';

export class IptRestApi2 implements INodeType {
	// The Fields parameter of Create and Update loads its field list here
	methods = {
		resourceMapping: {
			getWriteFields: writeFieldsLoader([
				addressInfo,
				customerInfo,
				productInfo,
				purchaseOrderInfo,
				purchaseOrderPositionInfo,
				salesOrderInfo,
				salesOrderPositionInfo,
				supplierInfo,
			]),
		},
	};

	description: INodeTypeDescription = {
		displayName: 'ipt RestApi2',
		name: 'iptRestApi2',
		icon: { light: 'file:iptRestApi2.svg', dark: 'file:iptRestApi2.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read and write myfactory data through the ipt RestApi2 interface',
		defaults: {
			name: 'ipt RestApi2',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'iptRestApi2Api', required: true }],
		requestDefaults: {
			// The credential holds the instance URL, the API path is fixed
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}/ipt/api',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Purchase Order',
						value: 'purchaseOrder',
					},
					{
						name: 'Purchase Order Position',
						value: 'purchaseOrderPosition',
					},
					{
						name: 'Sales Order',
						value: 'salesOrder',
					},
					{
						name: 'Sales Order Position',
						value: 'salesOrderPosition',
					},
					{
						name: 'Supplier',
						value: 'supplier',
					},
					{
						name: 'Table Data',
						value: 'tableData',
					},
				],
				// Product stays the default, because a node without a stored resource falls back to it
				default: 'product',
			},
			...addressDescription,
			...customerDescription,
			...productDescription,
			...purchaseOrderDescription,
			...purchaseOrderPositionDescription,
			...salesOrderDescription,
			...salesOrderPositionDescription,
			...supplierDescription,
			...tableDataDescription,
		],
	};
}
