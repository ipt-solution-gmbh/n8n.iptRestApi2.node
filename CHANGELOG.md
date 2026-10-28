# Changelog

## Unreleased

### Added

- Credential for ipt RestApi2 without a session: base URL of the myfactory instance, API key, app name, database and division. The connection test calls `GET /info` and also fails without a valid license.
- Product resource with the operations Get and Get Many. Get Many supports Return All, Limit and the options Fields and Sort.
- Error messages from the API response appear as the node error message.
- MIT license file.

### Changed

- Package metadata (author, repository, homepage, description) and a fixed version range for `@n8n/node-cli`.

### Removed

- Example resources from the node template.
