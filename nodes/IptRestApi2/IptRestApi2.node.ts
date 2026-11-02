import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { addressDescription } from './resources/address';
import { customerDescription } from './resources/customer';
import { productDescription } from './resources/product';
import { salesOrderDescription } from './resources/salesOrder';
import { salesOrderPositionDescription } from './resources/salesOrderPosition';

export class IptRestApi2 implements INodeType {
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
						name: 'Sales Order',
						value: 'salesOrder',
					},
					{
						name: 'Sales Order Position',
						value: 'salesOrderPosition',
					},
				],
				// Product stays the default, because a node without a stored resource falls back to it
				default: 'product',
			},
			...addressDescription,
			...customerDescription,
			...productDescription,
			...salesOrderDescription,
			...salesOrderPositionDescription,
		],
	};
}
