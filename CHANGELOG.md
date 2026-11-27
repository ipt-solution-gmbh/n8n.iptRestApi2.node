# Changelog

## 0.4.0 (2026-11-27)

### Added

- Contract resources: Sales Order Contract (`/salesordercontracts`), Sales Order Contract Order (`/salesordercontractorders`, the order plan), Sales Order Contract Type (`/salesordercontracttypes`, text key `ContractTypeName`), Sales Order Contract Term (`/salesordercontractterms`), Sales Order Contract Cancellation (`/salesordercontractcancellations`) and Sales Order Contract Pause (`/salesordercontractpauses`) with the operations Create, Delete (one record by ID or key), Get, Get Many and Update. Sales Order Contract Batch (`/salesordercontractbatches`) and Sales Order Contract Result (`/salesordercontractresults`) with Get and Get Many. Needs ipt RestApi2 29.21.0.
- Sales Order Contract offers Changed Since for Get Many.
- Sales Order Contract operation Generate Orders (`POST /salesordercontracts/generateorders`). It creates the sales orders that are due up to a date from the active contracts of the given contract types and returns the `batchId` of the run. Contract Types is a comma-separated list, To Date is required.
- Generate Orders has the switch Use Pauses in Additional Fields (`usePauses`, off by default, needs ipt RestApi2 58.5.0). With it, the API takes contract pauses into account like order generation in myfactory. Without it, and on older versions, pauses are ignored.
- The notices and the README describe the delete rules of contracts, contract types, terms and notice periods from ipt RestApi2 58.6.1 on: status 409 while they are still used or, for a contract, once Generate Orders wrote a result for it, and a deleted contract takes its order plan entries with it. Older versions delete without these checks.
- README: section on contracts with the steps from template sales order to generated orders, and a warning about Generate Orders in the section on AI agent tools.
- Resource Error Log (`/errorlogs`) with the operations Get and Get Many. It reads the error log of myfactory, only the entries of the database of the credential. Get returns the call stack of an entry, Get Many leaves it out. Get Many has the options Log Date From and Log Date To for a time range and Log ID Greater Than to read the entries added since the last run. Needs ipt RestApi2 58.7.0.

### Changed

- README: new section Example workflows with two step-by-step examples, create and update a customer group, and find and delete a customer.
- Action names without articles, following the n8n UX guidelines, for example "Create product in myfactory" instead of "Create a product in myfactory". The internal names of resources, operations and parameters are unchanged, so existing workflows keep working.
- Placeholders of input fields start with "e.g.", for example "e.g. 1234".
- README: messages that come from myfactory itself are in the language of the myfactory installation, for example German.

## 0.3.0 (2026-11-25)

### Added

- Master data lookup lists as resources: Unit (`/units`), Weight Unit (`/weightunits`), Product Group (`/productgroups`), Customer Group (`/customergroups`), Supplier Group (`/suppliergroups`), Product State (`/productstates`), Manufacturer (`/manufacturers`), Country (`/countries`), Currency (`/currencies`), Payment Condition (`/paymentconditions`), Shipment Condition (`/shipmentconditions`) and Delivery Condition (`/deliveryconditions`) with the operations Create, Delete (one record by key), Get, Get Many and Update. Contact Group (`/contactgroups`), Address Group (`/addressgroups`, needs ipt RestApi2 57.23.0) and Product Type (`/producttypes`) with Get and Get Many.
- Lists with a text key, such as units or countries, take the key as text. Get, Update and Delete send it as a query parameter on the key field (`GET /units?UnitName=kg`). The node stops if the key is empty, so Get never returns the whole list by mistake.
- Product State offers Changed Since for Get Many.
- The description of Data for Update of a list with a text key, and the README, warn that a key sent in Data renames the record while the records that use the old key keep it.

## 0.2.0 (2026-11-25)

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
