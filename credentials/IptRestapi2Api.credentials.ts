import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class IptRestapi2Api implements ICredentialType {
	name = 'iptRestapi2Api';

	displayName = 'Ipt Restapi2 API';

	// Link to your community node's README
	documentationUrl = 'https://github.com/org/-ipt-restapi2?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			body: {
				token: '={{$credentials.accessToken}}',
			},
			qs: {
				token: '={{$credentials.accessToken}}',
			},
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://example.com/instance/ipt/api',
			url: '/v1/user',
		},
	};
}
