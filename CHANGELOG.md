# Changelog

## Unreleased

### Added

- Credential for ipt RestApi2 without a session: base URL of the myfactory instance, API key, app name, database and division. The connection test calls `GET /info` and also fails without a valid license.
- Product resource with the operations Get and Get Many. Get Many supports Return All, Limit and the options Fields and Sort.
- Product operations Create and Update. Both take the fields as a JSON object in Data.
- Option Include for Product Get and Get Many to load attributes, history, multiple EANs and variants. Option All Data for Get Many.
- Simplify for Product Get and Get Many: returns a short, fixed list of fields.
- Action names mention myfactory, so the default tool description for AI agents says what the tool works on.
- README section on using the node as an AI agent tool.
- Error messages from the API response appear as the node error message.
- MIT license file.

### Changed

- Package metadata (author, repository, homepage, description) and a fixed version range for `@n8n/node-cli`.

### Removed

- Example resources from the node template.
