# Changelog

## Unreleased

### Added

- Resource Contact (`/contacts`) with the operations Create, Delete (one contact by ID), Get, Get Many and Update. Get and Get Many offer Include for attributes and history.
- Resource Support Case (`/supportcases`) with the operations Create, Delete (one case by ID, also deletes its positions), Get, Get Many and Update. Update sends the case ID in the request body, because the API takes the case from there. The descriptions say how Update writes history entries, clears the contact on a new address and rejects a contact or handling user that does not fit.
- Resource Support Case Position (`/supportcasepos`) with the operations Create, Delete (one position by ID), Get, Get Many and Update. Get and Get Many offer Include for the mail of the position.
- Resource Support Mail (`/supportmails`) with the operations Get and Get Many. Get Many has options to find the mails of a support case, a position or an e-mail address, a time range on the received date and the switch Include Content for text and attachments.
- Support Mail operation Download Attachment. It downloads the file of a mail attachment from the document store (`GET /documentstore/{id}?download=true`) as binary data, with file name and MIME type from the response.
- Option Changed Since for Get Many of Address, Contact, Customer, Product, Purchase Order, Sales Order, Supplier and Support Case (`changedsince`, needs ipt RestApi2 57.41.0). With it, each page becomes one item with `ChangedUntil`, `HasMore` and `Records`, also when nothing changed, so a workflow always gets the value for the next run.

### Changed

- Return All also follows `HasMore`, which the API reports instead of the page count when `count=false` is sent.
- Filters and Delete Multiple refuse the names `changedsince` and `count`, because the API does not use them as field filters.

## 0.1.0 (2026-11-10)

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
- Parameter Fields for Create and Update of every resource. It lets you pick single fields and enter their values. The field list is loaded from `openapi.json` of the installation. Data is the base of the request body and a field set in Fields replaces the same field from Data. Empty fields are not sent. For Update the list leaves out the ID field of the record.
- Resource Table Data with the operation Get Many. It reads the rows of any table or view of the client database (`GET /tabledatas`) and returns one item per row. Options Clause and Fields. The API key needs the read right `TableDatas` if rights are set for the access point.
- Resource Supplier with the operations Create, Delete (also Delete Multiple), Get, Get Many and Update.
- Resources Purchase Order and Purchase Order Position with the operations Create, Delete, Get, Get Many and Update. Purchase orders take their positions in the array Positions of Data, and Create returns the new purchase order with its positions.
- Purchase order actions Change Currency, Change Supplier, Confirm Delivery Dates, Copy, Recalculate, Refresh Prices, Renumber Positions, Set Completed, Set Printed and Transform, each with a notice that says what it changes in myfactory.
- MIT license file.
- README section on Custom API Call with the HTTP Request node and this credential.

### Changed

- Package metadata (author, repository, homepage, description) and a fixed version range for `@n8n/node-cli`.
- Package name `@ipt-solution/n8n-nodes-ipt-restapi2`, published with public access.

### Removed

- Example resources from the node template.
