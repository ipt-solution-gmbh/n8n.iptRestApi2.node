import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { productDescription } from './resources/product';

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
						name: 'Product',
						value: 'product',
					},
				],
				default: 'product',
			},
			...productDescription,
		],
	};
}
