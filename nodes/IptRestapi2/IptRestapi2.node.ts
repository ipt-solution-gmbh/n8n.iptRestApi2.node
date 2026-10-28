import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { userDescription } from './resources/user';
import { companyDescription } from './resources/company';

export class IptRestapi2 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ipt Restapi2',
		name: 'iptRestapi2',
		icon: { light: 'file:iptRestapi2.svg', dark: 'file:iptRestapi2.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Ipt Restapi2 API',
		defaults: {
			name: 'Ipt Restapi2',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'iptRestapi2Api', required: true }],
		requestDefaults: {
			baseURL: 'https://example.com/instance/ipt/api',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
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
						name: 'User',
						value: 'user',
					},
					{
						name: 'Company',
						value: 'company',
					},
				],
				default: 'user',
			},
			...userDescription,
			...companyDescription,
		],
	};
}
