# Changelog

## Unreleased

### Added

- Credential for ipt RestApi2 without a session: base URL of the myfactory instance, API key, app name, database and division. The connection test calls `GET /info` and also fails without a valid license.
- Product resource with the operations Get and Get Many. Get Many supports Return All, Limit and the options Fields and Sort.
- Product operations Create and Update. Both take the fields as a JSON object in Data.
- Product operation Delete. It returns one item that confirms the delete. The API refuses to delete a product that other records still refer to (status 409). The switch Delete Multiple (off by default) deletes all products that match a list of field filters.
- Option Include for Product Get and Get Many to load attributes, history, multiple EANs and variants. Option All Data for Get Many.
- Simplify for Product Get and Get Many: returns a short, fixed list of fields.
- Resources Address, Customer and Sales Order with the operations Create, Delete, Get, Get Many and Update. Address and Customer also offer Delete Multiple. Sales orders take their positions in the array Positions of Data, and Create returns the new sales order with its positions, and with All Data with all header fields.
- Sales order actions Change Currency, Change Customer, Check Credit, Complete, Copy, Create Purchase Order, Recalculate, Refresh Prices, Renumber Positions, Set Printed and Transform. Each returns the response of the API as one item.
- Resource Sales Order Position with the operations Create, Delete, Get, Get Many and Update. Get and Get Many offer Include for attributes and history.
- Options Filters and Clause for Get Many of every resource to search the list by field values or an SQL condition. The node sends the clause in brackets, so an OR in the clause does not cancel the filters.
- Notices for Delete, Delete Multiple, Sales Order Position Create and every sales order action that say what the operation changes in myfactory.
- A notice above Data shows a minimal example for Create and an example for Update of every resource, because Data starts as `{}` and hides its placeholder.
- Action names mention myfactory, so the default tool description for AI agents says what the tool works on.
- README section on using the node as an AI agent tool.
- Error messages from the API response appear as the node error message.
- If the API rejects filters or a clause as invalid SQL, the error description says how to write the clause.
- Clause, Fields and the number fields of the sales order actions filled by an AI agent with `$fromAI` count as empty when the model leaves them out, so the node sends no condition, field list or number.
- Option All Data for Create of every resource, off by default. When it is on, the node sends `alldata=true`, so the API returns all fields of the new record. For products the API returns only the sent fields and the ProductID either way.
- MIT license file.
- README section on Custom API Call with the HTTP Request node and this credential.

### Changed

- Package metadata (author, repository, homepage, description) and a fixed version range for `@n8n/node-cli`.
- Package name `@ipt-solution/n8n-nodes-ipt-restapi2`, published with public access.

### Removed

- Example resources from the node template.
