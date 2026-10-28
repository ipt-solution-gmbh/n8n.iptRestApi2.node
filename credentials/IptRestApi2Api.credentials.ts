import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class IptRestApi2Api implements ICredentialType {
	name = 'iptRestApi2Api';

	displayName = 'Ipt RestApi2 API';

	icon: Icon = {
		light: 'file:../nodes/IptRestApi2/iptRestApi2.svg',
		dark: 'file:../nodes/IptRestApi2/iptRestApi2.dark.svg',
	};

	documentationUrl =
		'https://github.com/ipt-solution-gmbh/n8n.iptRestApi2.node?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://example.com/instance',
			description:
				'URL of the myfactory instance, without "/ipt/api". The node adds the API path itself.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'API key of the RestApi2 access point',
		},
		{
			displayName: 'App Name',
			name: 'appName',
			type: 'string',
			required: true,
			default: '',
			description:
				'AppName of the myfactory instance, as set in the myfactory administrator. This is not the name of your own application.',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			required: true,
			default: '',
			description: 'Name of the myfactory client database',
		},
		{
			displayName: 'Division',
			name: 'division',
			type: 'number',
			required: true,
			default: 1,
			description: 'Number of the myfactory division',
		},
	];

	// The API works without a session: every request carries these four headers.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				GUID: '={{$credentials.apiKey}}',
				APPNAME: '={{$credentials.appName}}',
				DB: '={{$credentials.database}}',
				DIVISION: '={{$credentials.division}}',
			},
		},
	};

	// GET /info answers 401 for a wrong key, database or division. It skips the license check,
	// so an invalid license only shows up in the response body.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}/ipt/api',
			url: '/info',
			method: 'GET',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'Result.LicenseValid',
					value: false,
					message: 'Connection works, but the ipt RestApi2 add-in has no valid license',
				},
			},
		],
	};
}
