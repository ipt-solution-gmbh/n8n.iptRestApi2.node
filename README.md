# @ipt-solution/n8n-nodes-ipt-restapi2

> **Status: beta.** This node is under active development. Operations, parameters and outputs may still change before version 1.0. Test it on a test client before you use it with production data, especially Delete and the actions of sales and purchase orders.

This is an n8n community node. It lets you use ipt RestApi2 in your n8n workflows.

ipt RestApi2 is a REST interface for the myfactory ERP, provided as a myfactory add-in by ipt solution GmbH. It gives access to master data and documents such as products, customers and sales orders.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Example workflows](#example-workflows)
[Resources](#resources)
[Version history](#version-history)

## Installation

In n8n, open **Settings > Community Nodes**, select **Install** and enter the package name `@ipt-solution/n8n-nodes-ipt-restapi2`.

For details, follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The node offers the resources Address, Contact, Customer, Product, Purchase Order, Purchase Order Position, Sales Order, Sales Order Position, Supplier, Support Case and Support Case Position with the operations Create, Delete, Get, Get Many and Update. Support Mail is read-only with Get, Get Many and Download Attachment. Sales Order and Purchase Order also have actions such as Copy, Transform or Recalculate. Product is described in full below. The other resources work the same way, their sections list only what differs. In the API documentation (Swagger UI) these endpoints are listed under Products, Addresses & Contacts, Customers & Suppliers, Sales, Purchase, CRM, Base Data and Finance. The resource Table Data reads any table or view of the client database and has only Get Many. The master data lookup lists of myfactory, such as units, product groups, countries, currencies and payment conditions, are resources of their own, see **Master data: lookup lists** below.

**Product**

- **Create:** create a product (`POST /products`).
  - **Data** holds the fields of the new product as a JSON object. `Matchcode`, `BaseUnit`, `BaseDecimals` and `ProductGroup` are required, unless the access point has a template product in the API configuration. In that case the API takes every missing field except `ProductID` and `ProductNumber` from the template product. Without `ProductNumber` the API takes the next number from the number range in myfactory.
  - `BaseUnit` and `ProductGroup` must exist in myfactory. Replace `Stk` and `Allg.` in the minimal example with a unit and a product group of your installation (list them with the resources Unit and Product Group):

    ```json
    { "Matchcode": "Sample product", "BaseUnit": "Stk", "BaseDecimals": 0, "ProductGroup": "Allg." }
    ```

  - Above Data, a notice shows a minimal example for Create and an example for Update of each resource.
  - **Fields** below Data lets you pick single fields and enter their values, as an alternative or in addition to Data. Create and Update of every resource have it.
    - The list starts empty. Add each field you need with **Add field to send**. The node loads the field list from `openapi.json` of your installation, so it matches its version.
    - Data is the base of the request body. A field set in Fields replaces the same field from Data.
    - Empty fields are not sent. A field set to `false` or `0` is sent. To clear a field on purpose, use Data, for example `{"Name2": ""}`.
    - An added field of type date, list or boolean with a fixed empty value stops n8n before the workflow starts, for example "'ValidTo' expects a dateTime but we got ''". Remove fields you do not need instead of leaving them empty. An expression that resolves to an empty value is not sent, like an empty field.
    - For Update the field list leaves out the ID field of the record, because the ID comes from its own parameter. Lists such as sales order positions are not part of the field list, use Data for them.
  - **All Data** (off by default) exists for Create of every resource. When it is off, the parameter is not sent and the response has only a few fields. Turn it on to get the full record: the node then sends `alldata=true` and the API returns all fields of the new record. For products the API returns only the sent fields and the `ProductID`, with or without All Data. Use Get to read all fields of the new product.

- **Delete:** delete a product by its numeric ID (`DELETE /products/{id}`). Returns one item `{"deleted": true, "ProductID": 1234}`.
  - Deleting is permanent. myfactory removes the product together with its dependent data.
  - If the product is still in use, for example in sales or purchase documents, bills of materials, production orders or bookings, myfactory refuses the delete. The API answers with status 409 and the node fails with the reason from myfactory.
  - If rights are set for the access point in the API configuration, deleting needs the delete right for products. Without it the API answers with status 403.
  - **Delete Multiple** (off by default) deletes every product that matches all **Filters** (`DELETE /products?<field>=<value>&multidelete=true`). Each filter is a field name and a value, and the field must equal the value exactly. Several filters are combined with AND. Returns one item `{"deleted": true, "ProductIDs": [1234, 1235]}`. If no product matches the filters, the API answers with status 404 and the node fails.
  - **Warning:** Delete Multiple can delete many products in one step. Check the filters with Get Many first. The node refuses to send the request if there is no filter, a filter has no value, a field is used twice or a name is not a field name (for example `page`, `sort` or `clause`), because the API would ignore such a filter and delete every product.
  - With Delete Multiple the API deletes one product after the other and stops at the first product that other records still refer to (status 409). Products deleted before that stay deleted.
  - The list `ProductIDs` holds at most the first 1000 deleted products, because the API reports only one page of records. All matching products are deleted.
- **Get:** get a single product by its numeric ID (`GET /products/{id}`). A single product always has all fields.
  - **Simplify** returns only these fields: `ProductID`, `ProductNumber`, `Matchcode`, `Name1`, `ProductGroup`, `BaseUnit`, `EANNumber`, `InActive`, `ProductState`, `ChangeDate`.
  - **Options > Include** loads additional data: attributes, history, multiple EANs, variants.
- **Get Many:** get a list of products (`GET /products`).
  - **Return All** reads every page. The node requests pages of 1000 products, the largest page size the API allows.
  - **Limit** returns at most the given number of products (1 to 1000).
  - **Simplify** returns the same fields as for Get.
  - **Options > All Data** returns all fields of each product. Without it the list has the base fields only (`ProductID`, `ProductNumber`, `Matchcode`, `EANNumber`).
  - **Options > Fields** limits the response to the listed fields, for example `ProductID,ProductNumber,Matchcode`. The node then also sends `alldata=true`, so fields other than the base fields are returned too.
  - **Options > Include** loads additional data, as for Get.
  - **Options > Sort** sorts the list, for example `-ChangeDate,Matchcode`. A leading minus sorts in descending order.
  - **Options > Filters** and **Options > Clause** search the list, see [All resources](#all-resources).
- **Update:** change a product by its numeric ID (`PUT /products/{id}`).
  - **Data** holds the fields to change as a JSON object, for example `{"Matchcode": "New name"}`. Fields that are not listed stay unchanged.
  - **Fields** works as for Create.
  - Installations that require an `If-Match` header for every write are not supported yet. There the API rejects the update with status 428.

**Address**

- **Create** (`POST /addresses`): `Name1` and `Matchcode` are required. The API rejects a new address if an address with the same `Name1` and `Matchcode` exists. Without `AddressNumber` the API takes the next number from the number range in myfactory, without `Country` and `Language` the defaults of the installation. With All Data the response has all fields of the new address, without it only a few. Minimal example:

  ```json
  { "Matchcode": "SAMPLE", "Name1": "Sample Ltd" }
  ```

- **Delete** (`DELETE /addresses/{id}`): returns `{"deleted": true, "AddressID": 1234}`. **Delete Multiple** works as for products and returns `AddressIDs`. As for products, deleting is permanent and an address that is still in use is refused with status 409 and the reason from myfactory, for example an address that is still a customer or supplier.
- **Get** and **Get Many** (`GET /addresses`): **Simplify** returns `AddressID`, `AddressNumber`, `Matchcode`, `Name1`, `Street`, `PostalCode`, `City`, `Country`, `EMail`, `PhoneNr`. Without All Data a list has the base fields `AddressID`, `AddressNumber`, `Matchcode`, `Name1`. **Include** loads attributes and history.
- **Update** (`PUT /addresses/{id}`): as for products.

**Contact**

A contact is a contact person of an address.

- **Create** (`POST /contacts`): `AddressID` (the address the contact belongs to) and `Matchcode` are required. The API rejects an `AddressID` or `Country` that does not exist in myfactory. Contacts have no number range, so `ContactNumber` stays empty unless you send it. With All Data the response has all fields of the new contact, without it only a few. Minimal example, with `1234` standing for the `AddressID` of an existing address:

  ```json
  { "AddressID": 1234, "Matchcode": "SMITH" }
  ```

- **Delete** (`DELETE /contacts/{id}`): deletes one contact and returns `{"deleted": true, "ContactID": 1234}`. There is no Delete Multiple. Deleting is permanent and also removes the attribute values, newsletter entries and portal account of the contact. myfactory refuses to delete a contact that is used as document recipient, in sales or purchase documents, in sales contacts or in support cases, with status 409 and the reason.
- **Get** and **Get Many** (`GET /contacts`): **Simplify** returns `ContactID`, `AddressID`, `ContactNumber`, `Matchcode`, `FirstName`, `LastName`, `EMail`, `PhoneNr`, `MobilePhone`, `InActive`. Without All Data a list has the base fields `ContactID`, `AddressID`, `ContactNumber`, `Matchcode`, `ContactGroup`, `Department`, `PhoneNr`, `EMail`, `Street`, `Country`, `PostalCode`, `City`, `InActive`. **Include** loads attributes and history. For the contacts of one address, add the filter `AddressID`.
- **Update** (`PUT /contacts/{id}`): as for products.

**Customer**

- **Create** (`POST /customers`): a customer belongs to an address. Create the address first and pass its ID: `AddressID` is required. Without `CustomerNumber` the API takes the next number from the number range in myfactory. Without `CustomerGroup` it takes the first customer group in alphabetical order, without `CurrencyUnit` the internal currency. With All Data the response has all fields of the new customer, without it only a few. Minimal example, with `1234` standing for the `AddressID` of an existing address:

  ```json
  { "AddressID": 1234 }
  ```

- **Delete** (`DELETE /customers/{id}`): returns `{"deleted": true, "CustomerID": 1234}`. **Delete Multiple** works as for products and returns `CustomerIDs`. As for products, deleting is permanent and a customer that is still in use is refused with status 409 and the reason from myfactory, for example a customer that still has sales documents. If the myfactory setting to delete unused addresses is on, the address of a deleted customer is deleted too, unless another record such as a supplier or prospect still uses it. A later Delete of that address then fails with status 404.
- **Get** and **Get Many** (`GET /customers`): **Simplify** returns `CustomerID`, `CustomerNumber`, `AddressID`, `MatchcodeAdd`, `CustomerGroup`, `CurrencyUnit`, `PaymentConditions`, `IsFreezed`, `InActive`, `ChangeDate`. Name and postal address are fields of the address (`AddressID`). Without All Data a list has the base fields `CustomerID`, `AddressID`, `CustomerNumber`, `MatchcodeAdd`. **Include** loads attributes and history.
- **Update** (`PUT /customers/{id}`): as for products.

**Supplier**

- **Create** (`POST /suppliers`): a supplier belongs to an address. Create the address first and pass its ID: `AddressID` is required. `SupplierGroup` is required too: the short name of a supplier group of your installation (`SupplierGroupName` of the resource Supplier Group), not its description. An empty `SupplierGroup` takes the first supplier group in alphabetical order. Without `SupplierNumber` the API takes the next number from the number range in myfactory, without `CurrencyUnit` the internal currency. A purchase order needs a payment condition: set `PaymentConditions` to the `ConditionID` of a payment condition of your installation (resource Payment Condition). Without it, myfactory takes the payment condition of the supplier group or of one of its parent groups. If none of them has one, Create of a purchase order for this supplier fails with status 400 and a message from myfactory that no payment condition is given. With All Data the response has all fields of the new supplier, without it only a few. Minimal example, with `1234` standing for the `AddressID` of an existing address, `HL` for the short name of a supplier group and `1` for the `ConditionID` of a payment condition:

  ```json
  { "AddressID": 1234, "SupplierGroup": "HL", "PaymentConditions": 1 }
  ```

  An empty value in **Fields** is not sent. To pass an empty `SupplierGroup`, use Data.

- **Delete** (`DELETE /suppliers/{id}`): returns `{"deleted": true, "SupplierID": 1234}`. **Delete Multiple** works as for products and returns `SupplierIDs`. Deleting is permanent and also removes the bank details and product supplier entries of the supplier. myfactory refuses to delete a supplier that is used in purchase documents, in accounting or for devices, with status 409 and the reason. If the myfactory setting to delete unused addresses is on, the address of a deleted supplier is deleted too, unless another record such as a customer or prospect still uses it.
- **Get** and **Get Many** (`GET /suppliers`): **Simplify** returns `SupplierID`, `SupplierNumber`, `AddressID`, `MatchcodeAdd`, `SupplierGroup`, `CurrencyUnit`, `PaymentConditions`, `IsFreezed`, `InActive`, `ChangeDate`. Name and postal address are fields of the address (`AddressID`). Without All Data a list has the base fields `SupplierID`, `AddressID`, `SupplierNumber`, `SupplierGroup`. **Include** loads attributes and history.
- **Update** (`PUT /suppliers/{id}`): as for products.

**Sales Order**

- **Create** (`POST /salesorders`): `OrderType` (the number of the order type in myfactory, for example of an order confirmation or an invoice) and the customer (`CustomerID` or `CustomerNumber`) are required. The positions go into the array `Positions` of the same request, each with `ProductNumber` or `ProductID` and `Quantity`. Positions are optional. The response always contains the positions of the new sales order, each with its `OrderPosID`. All Data decides only about the header fields: with All Data the response has all of them, without it only a few. Minimal example with one position, where `2` stands for the number of an order type and `10001` and `1000` for the numbers of an existing customer and product:

  ```json
  {
  	"OrderType": 2,
  	"CustomerNumber": "10001",
  	"Positions": [{ "ProductNumber": "1000", "Quantity": 2 }]
  }
  ```

- **Delete** (`DELETE /salesorders/{id}`): deletes one sales order and returns `{"deleted": true, "OrderID": 1234}`. There is no Delete Multiple. Deleting is permanent. myfactory refuses to delete a processed sales order if its number range does not allow deleting or the user lacks the delete right, and a sales order that is the template of a contract or is linked to time billing or a time quota. The API then answers with status 409 and only the message "Order could not be deleted", without the reason.
- **Get** (`GET /salesorders/{id}`): a single sales order always comes with its positions, taxes and payments. **Include** loads attributes and history.
- **Get Many** (`GET /salesorders`): without All Data a list has the base fields `OrderID`, `OrderTypeDesc`, `OrderNumber`, `BookingDate`, `CustomerID`, `CustomerNumber`, `RepresentativeID`, `RepresentativeGroup`, `Matchcode`, `OrderSum`, `DeliveryDate`, `SalesDistrictID`. **Include** loads attributes, history, payments, positions and taxes.
- **Simplify** for Get and Get Many returns `OrderID`, `OrderNumber`, `OrderType`, `OrderTypeDesc`, `BookingDate`, `CustomerID`, `CustomerNumber`, `Name1`, `OrderSum`, `CurrUnit`, without positions.
- **Get Many with Simplify, Fields or All Data is expensive.** For these, the API loads the positions, taxes and payments of every sales order on the page, even though the response leaves them out. Keep **Limit** small for large lists.
- **Update** (`PUT /salesorders/{id}`): changes the given header fields. Entries in `Positions` change existing positions and need their `OrderPosID`, for example `{"Positions": [{"OrderPosID": 5678, "Quantity": 3}]}`. Entries without `OrderPosID` are ignored, so Update does not add positions. Use the resource Sales Order Position for that. Returns the sales order with its positions.

**Sales Order actions**

Each action works on one sales order, given by its `OrderID` (not the order number, get it from Sales Order > Get Many). A notice at the top of each action says what it changes. Required parameters are shown directly, optional ones are under **Additional Fields**. The output is what the API returns, as one item. Errors of the API (for example status 404 for an unknown sales order or 409 if myfactory refuses the action) appear as the node error message.

| Operation             | Request                                                                                                                                                                                                                                                                               | Output                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change Currency       | `POST /salesorders/{id}/changecurrency` with **Currency** and the optional **Exchange Rate** (0 uses the daily rate)                                                                                                                                                                  | The sales order with its positions                                                                                                                                         |
| Change Customer       | `POST /salesorders/{id}/changecustomer` with **New Customer ID** and the optional Prospect ID, Change Conditions, Keep Credit Card, Keep Documents, Refresh Commissions                                                                                                               | The sales order under its new ID. myfactory copies the order to the new customer, keeps the order number and deletes the old order, so the old `OrderID` no longer exists. |
| Check Credit          | `POST /salesorders/{id}/checkcredit`                                                                                                                                                                                                                                                  | `orderId`, `customerId`, `withinLimit`, `creditLimit`, `currentExposure`, `remaining`. Changes nothing.                                                                    |
| Complete              | `POST /salesorders/{id}/complete`                                                                                                                                                                                                                                                     | `orderId`, `completed`                                                                                                                                                     |
| Copy                  | `POST /salesorders/{id}/copy` with the optional Customer ID, Prospect ID, Order Type and switches. Without them the copy gets the customer and the order type of the source.                                                                                                          | The new sales order with its positions                                                                                                                                     |
| Create Purchase Order | `POST /salesorders/{id}/createpurchaseorder` with **Supplier ID**, **Position IDs** (comma-separated `OrderPosID` values of the sales order, for example `5678,5679`) and **Purchase Order Type** (0 uses the type preset in myfactory, without a preset the API rejects the request) | `orderId` and `orderNumber` of the purchase order, `orderType`, `supplierId`, `salesOrderId`, `setCompleted` and the list `positions`                                      |
| Recalculate           | `POST /salesorders/{id}/recalc`                                                                                                                                                                                                                                                       | The sales order with its positions                                                                                                                                         |
| Refresh Prices        | `POST /salesorders/{id}/refreshprices` with the optional Refresh Sales Prices (on by default) and Refresh Valuation Prices                                                                                                                                                            | The sales order with its positions                                                                                                                                         |
| Renumber Positions    | `POST /salesorders/{id}/renumberpositions`                                                                                                                                                                                                                                            | The sales order with its positions                                                                                                                                         |
| Set Printed           | `POST /salesorders/{id}/setprinted`                                                                                                                                                                                                                                                   | `orderId`, `orderState`, `alreadyPrinted`, `printBatchEntriesMarked`                                                                                                       |
| Transform             | `POST /salesorders/transform?sourceorderid=…&targetordertype=…` with **Source Order ID**, **Target Order Type** and the optional **Full Copy**                                                                                                                                        | The new sales order with its positions                                                                                                                                     |

- **Change Currency** switches the sales order to another currency and converts the prices of its positions. Use a currency code that is set up in myfactory, because neither the API nor myfactory rejects an unknown code.
- **Change Customer** takes the addresses and the taxation from the new customer. With Change Conditions on (default), the order also takes over the currency and price type of the new customer and the position prices are determined again. Without a customer it works only for offers, which can be moved to a prospect.
- **Check Credit** fails for a sales order without a customer.
- **Complete** marks the sales order and its main positions as completed and removes their product planning entries. myfactory accepts it only for processed or printed sales orders. If myfactory refuses, the API reports only a general error with status 409.
- **Create Purchase Order**: Delivery Address chooses where the supplier delivers: No Separate Address, the address of the sales order or its delivery address. Purchase Units converts the quantities into the purchase unit of each product, rounded up. Combination positions are not split into their parts.
- **Recalculate** recalculates the totals, taxes and position sums of the sales order, as after a change to a position.
- **Refresh Prices** also overwrites prices that were entered by hand, unless myfactory is set up to keep fixed prices. At least one of Refresh Sales Prices and Refresh Valuation Prices must be on, otherwise the API answers with status 400.
- **Renumber Positions** numbers the positions again in their order: 1, 2, 3 …, group titles open a level (1, 1.1), text and page break lines get no number. The order of the positions does not change.
- **Set Printed** marks a processed sales order as printed and checks off its open entries in print batches. Nothing is printed or sent. A sales order that is already printed is returned unchanged. Use this for documents that reach the recipient by other means. Changing `OrderState` with Update does not do this.
- **Transform** creates the follow-up document, for example a delivery note from an order confirmation. **Target Order Type** is the number of an order type of your installation, usually 3 for a delivery note. The target order type must be a follow-up type of the source order type in myfactory. If it is not, the error message of the API lists the allowed types. Without Full Copy only positions that are still open are taken over. Transform fails if the source sales order is locked for transforming or has no positions left to take over.

**Sales Order Position**

- **Create** (`POST /salesorderpositions`): `OrderID` is required. `PosType`: 1 product (the default, needs `ProductID` or `ProductNumber`), 2 manual position (send `Name1`, `Quantity`, `Unit` and `Price`), 3 alternative position (offers only), 4 text (`Name1` up to 100 characters, long text in `PosText`), 5 subtotal, 6 page break, 7 group title. Other values are rejected. `PosIndex` inserts the position before the position at that place (0 is the first), without it the position is appended. For a product position, a sent `Price` or `Discount` wins over the price lists and the position is marked as a manual price (`PriceManual` 0 turns this off). The sales order action Refresh Prices keeps it only if myfactory is set up to keep fixed prices. myfactory recalculates the sales order, but does not number the positions again: without `PosNumber` the new position gets the number of its predecessor plus one. Use the sales order action Renumber Positions for consecutive numbers. Returns the new position. With All Data the response has almost all fields, but some such as `OrderID` are missing. Use Get to read them. Without All Data the response has only a few fields. Minimal example, with `1234` standing for the `OrderID` of an existing sales order and `1000` for a product number:

  ```json
  { "OrderID": 1234, "ProductNumber": "1000", "Quantity": 2 }
  ```

- **Delete** (`DELETE /salesorderpositions/{id}`): deletes one position for good and returns `{"deleted": true, "OrderPosID": 5678}`. myfactory recalculates the sales order. The API does not check whether the sales order is already processed. There is no Delete Multiple.
- **Get** and **Get Many** (`GET /salesorderpositions`): **Simplify** returns `OrderPosID`, `OrderID`, `PosNumber`, `ProductID`, `ProductNumber`, `Name1`, `Quantity`, `Unit`, `Price`, `Turnover`. Without All Data a list has the base fields `OrderPosID`, `OrderID`, `PosIndex`, `PosType`, `PosNumber`, `ProductID`, `ProductNumber`, `Name1`, `Quantity`, `Unit`, `Price`, `Turnover`, `PosDeleted`. **Include** loads attributes and history. For the positions of one sales order, add the filter `OrderID`.
- **Update** (`PUT /salesorderpositions/{id}`): as for products. `OrderID` and `PosType` cannot be changed. `PosIndex` moves the position to that place in the sales order (0 is the first), the position numbers stay the same. myfactory recalculates the sales order.

**Purchase Order**

Purchase orders work like sales orders. The differences:

- **Create** (`POST /purchaseorders`): `OrderType` (the number of a purchase order type in myfactory, for example of an order or a goods receipt) and the supplier (`SupplierID` or `SupplierNumber`) are required. The positions go into the array `Positions`, each with `ProductNumber` or `ProductID` and `Quantity`. myfactory numbers the positions consecutively and saves the new purchase order as processed, so a goods receipt books the stock at once. The response always contains the positions, All Data decides only about the header fields. Minimal example with one position, where `1` stands for the number of a purchase order type and `70001` and `1000` for the numbers of an existing supplier and product:

  ```json
  {
  	"OrderType": 1,
  	"SupplierNumber": "70001",
  	"Positions": [{ "ProductNumber": "1000", "Quantity": 10 }]
  }
  ```

- **Delete** (`DELETE /purchaseorders/{id}`): deletes one purchase order and returns `{"deleted": true, "OrderID": 1234}`. There is no Delete Multiple. Deleting is permanent. For order types with a financial effect, such as purchase invoices, myfactory also deletes the open item and the accounting transfer entry. myfactory refuses to delete a processed purchase order if its number range does not allow deleting or the user lacks the delete right. The API then answers with status 409 and only the message "Order could not be deleted", without the reason.
- **Get** (`GET /purchaseorders/{id}`): a single purchase order always comes with its positions, taxes and payments. **Include** loads attributes and history.
- **Get Many** (`GET /purchaseorders`): without All Data a list has the base fields `OrderID`, `BookingDate`, `OrderTypeDesc`, `SupplierID`, `Name1`, `SupplierNumber`, `Matchcode`, `DeliveryDate`, `OrderSum`, `OrderNumber`, `OrderState`, `Completed`. **Include** loads attributes, history, payments, positions and taxes. As for sales orders, Get Many with Simplify, Fields or All Data loads the details of every purchase order on the page, so keep **Limit** small.
- **Simplify** for Get and Get Many returns `OrderID`, `OrderNumber`, `OrderType`, `OrderTypeDesc`, `BookingDate`, `DeliveryDate`, `SupplierNumber`, `Name1`, `OrderSum`, `CurrUnit`, without positions.
- **Update** (`PUT /purchaseorders/{id}`): changes the given header fields. Entries in `Positions` change existing positions and need their `OrderPosID`. Entries without `OrderPosID` are ignored, use the resource Purchase Order Position to add positions. Returns the purchase order with its positions.

**Purchase Order actions**

Each action works on one purchase order, given by its `OrderID` (not the order number, get it from Purchase Order > Get Many). As for sales orders, a notice at the top of each action says what it changes, optional parameters are under **Additional Fields** and the output is what the API returns, as one item.

| Operation              | Request                                                                                                                                                                                  | Output                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change Currency        | `POST /purchaseorders/{id}/changecurrency` with **Currency** and the optional **Exchange Rate** (0 uses the daily rate)                                                                  | The purchase order with its positions                                                                                                                                         |
| Change Supplier        | `POST /purchaseorders/{id}/changesupplier` with **New Supplier ID** and the optional Change Conditions, Keep Documents, Refresh Texts                                                    | The purchase order under its new ID. myfactory copies the order to the new supplier, keeps the order number and deletes the old order, so the old `OrderID` no longer exists. |
| Confirm Delivery Dates | `POST /purchaseorders/{id}/confirmdeliverydates` with **Confirmed Delivery Date** and the optional Confirmation Text and Order Confirmation Date. At least one of the three is required. | `orderId`, `confirmablePositions`, `confirmedPositions`, `failures`, `orderConfirmationDate`                                                                                  |
| Copy                   | `POST /purchaseorders/{id}/copy` with the optional Supplier ID, Order Type and switches. Without them the copy gets the supplier and the order type of the source.                       | The new purchase order with its positions                                                                                                                                     |
| Recalculate            | `POST /purchaseorders/{id}/recalc`                                                                                                                                                       | The purchase order with its positions                                                                                                                                         |
| Refresh Prices         | `POST /purchaseorders/{id}/refreshprices`                                                                                                                                                | The purchase order with its positions                                                                                                                                         |
| Renumber Positions     | `POST /purchaseorders/{id}/renumberpositions`                                                                                                                                            | The purchase order with its positions                                                                                                                                         |
| Set Completed          | `POST /purchaseorders/{id}/setcompleted`                                                                                                                                                 | `orderId`, `orderCompleted`, `orderState`                                                                                                                                     |
| Set Printed            | `POST /purchaseorders/{id}/setprinted`                                                                                                                                                   | `orderId`, `orderState`, `alreadyPrinted`, `printBatchEntriesMarked`                                                                                                          |
| Transform              | `POST /purchaseorders/transform?sourceorderid=…&targetordertype=…` with **Source Order ID**, **Target Order Type** and the optional **Full Copy**                                        | The new purchase order with its positions                                                                                                                                     |

- **Change Currency** switches the purchase order to another currency and converts the prices of its positions. The API does not check the currency code.
- **Change Supplier**: with Change Conditions on (default), the order takes over the currency and price type of the new supplier and the position prices are determined again. myfactory refuses the change for a purchase order it treats as read-only or that already has an external production order.
- **Confirm Delivery Dates** records the order confirmation of the supplier for all product and manual positions: each gets the confirmed delivery date, keeps the date requested before and updates the material planning. Write dates as `2026-10-01` or `01.10.2026`. The confirmation text has up to 100 characters. A confirmation cannot be withdrawn with this action. If myfactory refuses some positions, they are listed in `failures`. If it refuses all of them, the API answers with status 409.
- **Refresh Prices** takes the current purchase prices for all product positions and also overwrites prices entered by hand. myfactory saves the change without processing the purchase order, so a processed purchase order goes to the state in progress (`OrderState` 2).
- **Renumber Positions** works as for sales orders.
- **Set Completed** marks the purchase order and its main positions as completed and removes their material planning entries. myfactory accepts it only for processed or printed purchase orders. Changing `OrderCompleted` with Update does not do this.
- **Set Printed** works as for sales orders.
- **Transform** creates the follow-up document, for example a goods receipt from an order or a purchase invoice from a goods receipt. **Target Order Type** is the number of a purchase order type of your installation. The new document is saved as processed, so a goods receipt books the stock at once. The target order type must be a follow-up type of the source order type in myfactory. If it is not, the error message of the API lists the allowed types. Transform fails if the source purchase order is locked for transforming, already has an unprocessed follow-up document or has no positions left to take over.

**Purchase Order Position**

Works like Sales Order Position, with these differences:

- **Create** (`POST /purchaseorderpositions`): `OrderID` is the ID of the purchase order. `PosType` 3 (alternative position) does not exist for purchase orders. The other types, `PosIndex`, `PosNumber`, `Price` and `Discount` work as for sales order positions, except that the purchase order action Refresh Prices always overwrites a sent `Price` or `Discount`. myfactory recalculates the purchase order, use the purchase order action Renumber Positions for consecutive numbers. Minimal example, with `1234` standing for the `OrderID` of an existing purchase order and `1000` for a product number:

  ```json
  { "OrderID": 1234, "ProductNumber": "1000", "Quantity": 10 }
  ```

- **Delete** (`DELETE /purchaseorderpositions/{id}`): deletes one position for good and returns `{"deleted": true, "OrderPosID": 5678}`. myfactory recalculates the purchase order. The API does not check whether the purchase order is already processed. There is no Delete Multiple.
- **Get** and **Get Many** (`GET /purchaseorderpositions`): **Simplify** returns `OrderPosID`, `OrderID`, `PosNumber`, `ProductNumber`, `Name1`, `Quantity`, `Unit`, `Price`, `Turnover`, `DeliveryDate`. Without All Data a list has the base fields `OrderID`, `ProductID`, `PosType`, `PosNumber`, `Quantity`, `Price`, `Name1`, `PosIndex`, `ProductNumber`, `Unit`, `Turnover`, `OrderPosID`, `PosDeleted`. **Include** loads attributes and history. For the positions of one purchase order, add the filter `OrderID`.
- **Update** (`PUT /purchaseorderpositions/{id}`): as for sales order positions. The fields of the delivery date confirmation (`DeliveryRequestDate`, `DeliveryReminderDate`, `DeliveryDateConfirmationText`, `CountDeliveryDateChange`) are ignored, use the purchase order action Confirm Delivery Dates.

**Support Case**

- **Create** (`POST /supportcases`): `AddressID` is required. Send `CaseDesc` too, the short description of up to 100 characters. Without it myfactory sets a placeholder text, and Update fails until `CaseDesc` is changed. myfactory assigns `CaseNumber` and presets the state, priority and handling user from its support settings. `ContactID` must be a contact of the address and `HandlingUser` the short name of a myfactory user, otherwise the API answers with status 400. Depending on the support settings in myfactory, `SupportDepartment` or `HandlingUser` can be required too. The response holds only the sent fields, `CaseID` and `CaseNumber`, with or without All Data. Use Get to read all fields. Minimal example, with `1234` standing for the `AddressID` of an existing address:

  ```json
  { "AddressID": 1234, "CaseDesc": "Printer does not start" }
  ```

- **Delete** (`DELETE /supportcases/{id}`): deletes one support case and returns `{"deleted": true, "CaseID": 1234}`. There is no Delete Multiple. Deleting is permanent and also deletes all positions of the case. The mails of the positions are not deleted, but they no longer belong to a support case and Support Mail no longer returns them. myfactory refuses to delete a case with recorded times, with status 409 and the reason.
- **Get** and **Get Many** (`GET /supportcases`): **Simplify** returns `CaseID`, `CaseNumber`, `CaseDesc`, `AddressID`, `ContactID`, `CaseState`, `CasePriority`, `HandlingUser`, `CreationDate`, `ChangeDate`, without the long texts `SupportQuestion` and `SupportReply`. Every field of a support case is a base field, so a list has all fields even without All Data. There is no Include.
- **Update** (`PUT /supportcases/{id}`): changes the given fields like the support case dialog of myfactory.
  - Each change of `AddressID`, `ContactID`, `HandlingUser`, `CasePriority`, `SupportDepartment` or `CaseState` adds an entry to the history of the case. The same value sent again adds none.
  - A new `AddressID` without `ContactID` clears the contact.
  - A `ContactID` that is not a contact of the address of the case, or a `HandlingUser` that is not a myfactory user, is rejected with status 400 and nothing is changed.
  - Setting `CaseState` to the completion state of the support settings closes the case. Another state reopens a closed case.
  - The response holds only the sent fields and `CaseID`. Use Get to read all fields.
  - The API takes the case from `CaseID` in the request body. The node adds it from Support Case ID, so do not send it in Data.

**Support Case Position**

A position is one entry in the history of a support case, for example a call, a reply or an incoming mail.

- **Create** (`POST /supportcasepos`): `CaseID` (the ID of the support case), `PosType` and `PosDesc` (short description, up to 150 characters) are required. `PosType` is the ID of an action type of your installation, listed in the table `tdSupportCasePosTypes` (read it with Table Data). `PosComment` holds the long text. myfactory sets the date and the user and marks the support case as changed. `PosID` and `CreationUser` are assigned by myfactory, the API rejects them in the request. Minimal example, with `1234` standing for the `CaseID` of an existing support case and `6` for an action type:

  ```json
  { "CaseID": 1234, "PosType": 6, "PosDesc": "Called the customer" }
  ```

- **Delete** (`DELETE /supportcasepos/{id}`): deletes one position for good and returns `{"deleted": true, "PosID": 5678}`. There is no Delete Multiple. myfactory does not check whether the position is still needed. The mail of the position is not deleted, but Support Mail no longer returns it unless another position refers to it.
- **Get** and **Get Many** (`GET /supportcasepos`): **Simplify** returns `PosID`, `CaseID`, `PosDate`, `UserName`, `PosType`, `PosDesc`, `PosComment`, `PosState`, `MailID`, `Mail`. Without All Data a list has the base fields `PosID`, `CaseID`, `PosDate`, `UserName`, `PosType`, `PosDesc`, `PosState`, `BySupportMail`, `MailID`, `SendMailID`. **Include > Mail** adds the mail of the position as `Mail` (header, sender and recipients, without the text): the sent mail if the position has one, otherwise the incoming one. For the positions of one support case, add the filter `CaseID`.
- **Update** (`PUT /supportcasepos/{id}`): as for products. `CaseID` and `CreationUser` cannot be changed, `PosType`, `PosDesc` and `UserName` must not be empty. myfactory marks the support case as changed.

**Support Mail**

The mails that belong to a support case position: incoming mails and mails sent from the support case. Other mailboxes of the installation are not available. The endpoint is read-only, so there is no Create, Update or Delete.

- **Get** (`GET /supportmails/{id}`): a single mail, given by its `MailID`, always comes with `Content`: `Text` (plain text part), `Html` (HTML part as stored) and `Attachments` (each with `DocumentID`, `FileName`, `ContentType`, `ContentID`). A missing part is `null`. `MailHeader` holds the header lines of the mail.
- **Get Many** (`GET /supportmails`): each mail has the header fields, the sender `From` and the recipients `To`, `Cc`, `Bcc`, `ReplyTo` (each with `EMail`, `Alias`, `AddressID`, `SalesContactID`, the IDs are 0 if myfactory did not assign the address), and `CaseID`, `CaseNumber`, `PosID` of the support case position.
  - **Options > Support Case ID**, **Support Case Number** and **Support Case Position ID** return the mails of one support case or position.
  - **Options > From**, **To**, **Cc**, **Bcc** and **Reply To** return the mails with exactly this e-mail address in that role. They search all mail addresses of the installation and take some hundred milliseconds on large installations.
  - **Options > Received Since** and **Received Before** limit the list to a time range of `ReceivedDate`, for example for a regular sync: set Received Since to the time of the last run. The time counts as the local time of the myfactory server, an offset is ignored. Mails without a received date are left out. The node adds the range to the clause, together with **Options > Clause** if set. Support mails have no change date, so there is no Changed Since here.
  - **Options > Include Content** adds `Content` to each mail. The API reads it from the document storage, about one second per 100 mails, so keep the Limit small or read the content with Get.
  - **Options > Sort** works on the header fields, for example `-ReceivedDate`. `CaseNumber`, `From` and the other fields that are not columns of the mail header cannot be used for sorting, the API answers with status 400.
  - **Simplify** for Get and Get Many returns `MailID`, `Subject`, `MailDate`, `ReceivedDate`, `From`, `To`, `CaseID`, `CaseNumber`, `PosID`, `Content`. `From`, `To` and `Content` come as whole objects. A list has `Content` only with Include Content.
- **Download Attachment** (`GET /documentstore/{id}?download=true`): downloads the file of an attachment as binary data. **Document ID** is the `DocumentID` from `Content.Attachments`. **Put Output File in Field** names the binary field, `data` by default. The JSON of the item holds `DocumentID`, `FileName`, `MimeType` and `FileSize`, file name and MIME type come from the response. If rights are set for the access point, the API key needs the read right for the document store.

**Table Data**

- **Get Many** (`GET /tabledatas?table=…`): reads the rows of a table or view of the myfactory client database. There is no Get, Create, Update or Delete, because the endpoint is read-only.
  - **Table** is required: the name of a table or view without schema, for example `tdProducts`. The API answers with status 404 if no table or view of that name exists. The tables of the interface itself (`tdIptRestApi2…`) are not available, the API answers with status 403.
  - If rights are set for the access point in the API configuration, it needs the read right `TableDatas`. Without it the API answers with status 403.
  - Each row becomes one n8n item with the columns of the table as fields.
  - **Return All** and **Limit** work as for products.
  - The API cannot sort this endpoint and reads the rows in no fixed order. Return All over several pages (more than 1000 rows) can therefore skip rows or return a row twice. For large tables, narrow the rows with Clause, for example to a range of IDs, so that the result fits on one page.
  - **Options > Clause** searches the rows, as described under [All resources](#all-resources), with the column names of the table.
  - **Options > Fields** limits the response to the listed columns, for example `ProductID,ProductNumber,Matchcode`. Upper and lower case do not matter, unknown names are ignored. Without Fields each row has all columns.
  - There is no Filters, Sort, Simplify, All Data or Include. Use Clause to search.

**Master data: lookup lists**

The master data lookup lists of myfactory are lists that other records refer to by their key, for example a product to its unit (`BaseUnit`), product group and manufacturer, an address to its country, a customer to its customer group, currency and payment condition. They work like the other resources, with these rules:

- **Text keys.** Most lists have a short text as key, for example the unit `kg`. Get, Update and Delete send it as a query parameter named after the key field, for example `GET /units?UnitName=kg`. The key parameter is required. The node stops if it is empty, because the API would answer Get with the whole list. An unknown key gives status 404. Product State, Product Type, Manufacturer and Payment Condition have a numeric ID instead and use the path, for example `GET /manufacturers/12`.
- **Create:** a text key must be part of Data, otherwise the API answers with status 400. Keys are short: up to 10 characters, for countries 5 and for currencies 3. A longer value is rejected with status 400. Numeric IDs are assigned by the API.
- **Update: do not change the key.** A key sent in Data renames the record. Products, documents, addresses and other records that use the old key are not changed and then refer to a record that no longer exists. Send only the fields you want to change and leave the key out of Data. Rename a record in myfactory instead. The field list of **Fields** leaves the key out for Update.
- **Delete** removes one record, given by its key. There is no Delete Multiple. It returns one item such as `{"deleted": true, "UnitName": "kg"}`. Deleting is permanent. myfactory refuses to delete a record that is still in use as listed below, with status 409 and the reason from myfactory.
- **Get** returns all fields of the record. **Get Many** has the options of the other resources (Filters, Clause, Sort, Fields, All Data). There is no Include.
- If rights are set for the access point in the API configuration, each list needs its own read, write and delete rights. Without them the API answers with status 403.

The lists:

- **Unit** (`/units`, key `UnitName`, parameter Unit Name): Create, Delete, Get, Get Many, Update. Create needs `UnitName` and `UnitDesc`. **Simplify** returns `UnitName`, `UnitDesc`, `UnitCode`, which are also the base fields. Delete is refused while the unit is used, for example by products, bills of materials, document positions or stock entries.
- **Weight Unit** (`/weightunits`, key `UnitName`, parameter Weight Unit Name): Create, Delete, Get, Get Many, Update. Create needs `UnitName` and `UnitDesc`. **Simplify** returns `UnitName`, `UnitDesc`, `UnitConversion`, `UnitCoefficient`, which are also the base fields. Delete is refused while products use the weight unit.
- **Product Group** (`/productgroups`, key `ProductGroupName`, parameter Product Group Name): Create, Delete, Get, Get Many, Update. Create needs `ProductGroupName` and `ProductGroupDesc`. **Simplify** returns `ProductGroupName`, `ProductGroupDesc`, `ProductGroupTree`, `PriceGroup`, `InActive`. Delete also removes entries that belong to the group, such as its translations. It is refused while the product group is used, for example by products, document positions, inventories or statistics.
- **Customer Group** (`/customergroups`, key `CustomerGroupName`, parameter Customer Group Name): Create, Delete, Get, Get Many, Update. Create needs `CustomerGroupName` and `CustomerGroupDesc`. **Simplify** returns `CustomerGroupName`, `CustomerGroupDesc`, `InActive`, which are also the base fields. Delete also removes entries that belong to the group, such as its commission entries. It is refused while the customer group is used, for example by customers, sales documents, statistics or budgets.
- **Supplier Group** (`/suppliergroups`, key `SupplierGroupName`, parameter Supplier Group Name): Create, Delete, Get, Get Many, Update. Create needs `SupplierGroupName` and `SupplierGroupDesc`. **Simplify** returns `SupplierGroupName`, `SupplierGroupDesc`, `SupplierGroupTree`, which are also the base fields. Delete is refused while suppliers belong to the group.
- **Contact Group** (`/contactgroups`, key `ContactGroupName`, parameter Contact Group Name): Get and Get Many only, the endpoint is read-only. **Simplify** returns `ContactGroupName`, `ContactGroupDesc`, which are also the base fields.
- **Address Group** (`/addressgroups`, key `AddressGroupName`, parameter Address Group Name): Get and Get Many only, the endpoint is read-only. **Simplify** returns `AddressGroupName`, `AddressGroupDesc`, which are also the base fields.
- **Product State** (`/productstates`, numeric `StateID`, parameter Product State ID): Create, Delete, Get, Get Many, Update. Create needs `StateDesc`, the API assigns `StateID`. **Simplify** returns `StateID`, `StateDesc`, `SalesOfferLock`, `SalesOrderLock`, `SalesDeliveryLock`, `PurchaseOrderLock`, `PPSLock`, `WebPortalLock`, `WarningAvailableStock`, `ChangeDate`. Every field is a base field. Get Many also offers **Changed Since**. Delete is refused while products have this state.
- **Product Type** (`/producttypes`, numeric `ProductTypeID`, parameter Product Type ID): Get and Get Many only. Product types are defined by myfactory. **Simplify** returns `ProductTypeID`, `ProductTypeDesc`, `IsSales`, `IsPurchase`, `IsStock`, `IsCombination`, `IsResourceList`, `IsService`, `Edition`, which are also the base fields.
- **Manufacturer** (`/manufacturers`, numeric `ManufacturerID`, parameter Manufacturer ID): Create, Delete, Get, Get Many, Update. Create needs `ManufacturerName`, the API assigns `ManufacturerID`. **Simplify** returns `ManufacturerID`, `ManufacturerName`, `ManufacturerKey`, `InActive`, which are also the base fields. Delete is refused while the manufacturer is assigned to products.
- **Country** (`/countries`, key `CountryID`, parameter Country ID): Create, Delete, Get, Get Many, Update. Create needs `CountryID` and `CountryDesc`. **Simplify** returns `CountryID`, `CountryDesc`, `CountryISO2`, `CountryISO3`, `CountryNumber`, `CountryPhonePrefix`, `CountryGroup`, `TaxEUCountry`, `Webshop`, `ExternalID`. Every field is a base field. Delete is refused while addresses use the country.
- **Currency** (`/currencies`, key `CurrUnit`, parameter Currency Unit): Create, Delete, Get, Get Many, Update. Create needs `CurrUnit`, `CurrSign` and `CurrDesc`. **Simplify** returns `CurrUnit`, `CurrSign`, `CurrDesc`, `CurrDecimals`, `CurrRound`, which are also the base fields. Delete also removes its exchange rates. It is refused while the currency is used, for example by customers, sales or purchase documents or bookings.
- **Payment Condition** (`/paymentconditions`, numeric `ConditionID`, parameter Payment Condition ID): Create, Delete, Get, Get Many, Update. Create needs `CollectionType`: the key of a collection type of your installation, listed in the table `tdCollectionTypes` (read it with Table Data). `ConditionDesc` is optional, the API assigns `ConditionID`. **Simplify** returns `ConditionID`, `ConditionDesc`, `ConditionShortDesc`, `CollectionType`, `PaymentTarget`, which are also the base fields. Delete is refused while the payment condition is used, for example by customers, customer groups, suppliers or payments of documents.
- **Shipment Condition** (`/shipmentconditions`, key `ShipmentCondName`, parameter Shipment Condition Name): Create, Delete, Get, Get Many, Update. Create needs `ShipmentCondName` and `ShipmentCondDesc`. **Simplify** returns `ShipmentCondName`, `ShipmentCondDesc`, `InActive`, which are also the base fields. Delete also removes its shipping prices and zones. It is refused while customers or suppliers use the shipment condition.
- **Delivery Condition** (`/deliveryconditions`, key `DeliveryCondName`, parameter Delivery Condition Name): Create, Delete, Get, Get Many, Update. Create needs `DeliveryCondName` and `DeliveryCondDesc`. **Simplify** returns `DeliveryCondName`, `DeliveryCondDesc`, `InActive`, which are also the base fields. Delete is refused while customers or suppliers use the delivery condition.

Minimal example for Create of a unit:

```json
{ "UnitName": "box", "UnitDesc": "Box" }
```

**All resources**

Get Many has two options to search the list. Use Filters for simple matches and Clause for dates, comparisons and OR.

- **Filters**: one or more pairs of field name and value, for example `ProductGroup` = `Default`. The field must equal the value exactly. Several filters are combined with AND. Upper and lower case in the field name do not matter. The API converts the value by the type of the field: write dates as `2026-10-01` or `01.10.2026`, decimals with a point or a comma, and yes/no fields such as `InActive` as `-1` (yes) or `0` (no). The node refuses names that the API would not use as a filter (for example `page`, `sort` or `clause`), a filter without a value and a field used twice. Filters cannot find empty fields, use Clause with `IS NULL` for those.
- **Clause**: an SQL condition on the table columns of the resource. The node puts the clause in brackets and the API combines it with the filters by AND. Fields of the API response that are not table columns (for example `Positions` of a sales order) cannot be used. Write `=` as `$EQ$`, `<>` as `$NE$`, `<` as `$LT$`, `>` as `$GT$`, `>=` as `$GT$$EQ$`, `<=` as `$LT$$EQ$`, `%` as `$P100$` and `:` as `$2P$`. `IN`, `LIKE`, `IS NULL`, `AND` and `OR` are allowed. Write dates as `'yyyyMMdd'`, with a time as `'yyyy-MM-ddTHH$2P$mm$2P$ss'`. Examples:
  - Sales orders of October 2026: `BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'`
  - Products changed since 8 o'clock on 1 October 2026: `ChangeDate$GT$$EQ$'2026-10-01T08$2P$00$2P$00'`
  - Products of two product groups: `ProductGroup IN ('Tools', 'Parts')` or `ProductGroup$EQ$'Tools' OR ProductGroup$EQ$'Parts'`
  - Products with "Hammer" in the matchcode: `Matchcode LIKE '$P100$Hammer$P100$'`
  - Addresses whose name has an umlaut as the second letter, `_` stands for any one character: `Name1 LIKE 'M_ller'`
  - Products without an EAN: `EANNumber IS NULL OR EANNumber$EQ$''`
  - Sales orders over 1000: `OrderSum$GT$1000`
- The API rejects a clause with status 400 if it
  - contains characters outside printable ASCII, for example umlauts, line breaks or tabs (for an umlaut use `_` as a placeholder in `LIKE` instead),
  - contains `;`, `--` or `/*`,
  - has an odd number of single quotes,
  - is longer than 2000 characters, including the two brackets the node adds,
  - contains SQL keywords such as `SELECT`, `SET`, `UPDATE`, `CREATE`, `CHAR` or `CONVERT`, or hex values such as `0x1F`. This also applies inside text, so `Matchcode LIKE '$P100$SET$P100$'` is rejected too.
- A long `IN (...)` list soon reaches the 2000 characters. Filter on another field instead, or use a range of IDs such as `OrderID$GT$5000` and continue with the next range.
- If SQL Server rejects the filters or the clause, for example because of an unknown column name, the API answers with status 400 and a message that starts with "Filter produced invalid SQL". The node keeps that message and adds a hint on how to write the clause.

Return All keeps Filters and Clause for every page.

**Changed Since** (Options of Get Many for Address, Contact, Customer, Product, Product State, Purchase Order, Sales Order, Supplier and Support Case) reads only the records created or changed at or after a point in time, for a regular sync (`GET …?changedsince=…&count=false`). Positions, support case positions, support mails, table data and the other master data lookup lists have no change date of their own and do not offer it.

- The API compares the time with `ChangeDate` or `CreationDate`, so new records count too. A time without offset counts as the local time of the myfactory server. A time with offset, for example from `{{ $now.toISO() }}`, is converted.
- **The output changes.** Each page becomes one item `{"ChangedUntil": "…", "HasMore": false, "Records": [ … ]}`, also when nothing changed. Use the **Split Out** node on `Records` to get one item per record.
- **ChangedUntil** is the value for Changed Since of the next run. Store it, for example in a data table, and pass it unchanged next time. It lies two minutes before the request, so a record can arrive in two runs in a row, but never in none. Match records by their ID.
- **Turn on Return All.** Without it, the node reads one page up to Limit. If `HasMore` is `true`, changes were left out, and using that ChangedUntil would skip them for good. With Return All every page becomes its own item: use ChangedUntil of the first item, `{{ $('<node name>').first().json.ChangedUntil }}`. Later pages carry a later value that can skip records changed while the pages were read.
- Leave Sort empty with Return All. The API then reads the records in the order of their ID, and a record changed during the run keeps its place. Sorting by a date could move records between pages and skip one.
- Deleted records are not reported.

**Simplify** (Get and Get Many, off by default) returns a short, fixed list of fields per resource, listed with each resource above. Use it to keep the output small, for example for an AI agent. If **Options > Fields** of Get Many is set, it wins over Simplify. Both restrict the response to the named fields, so additional data from Include is then left out.

Each record becomes its own n8n item. Create and Update return the record as stored after the write, except for support cases, where the response holds only the sent fields. Which fields Create returns depends on All Data and the resource, see above. Errors returned by the API (for example "Login failed" or "No records found") appear as the error message of the node. Messages that come from myfactory itself, for example why a record cannot be deleted, are in the language of the myfactory installation, for example German.

With Delete Multiple the API deletes one record after the other and stops at the first record it cannot delete. The delete is not atomic: records deleted before that stay deleted.

**Custom API Call**

n8n adds **Custom API Call** to the resources and operations of the node. Use it for endpoints of the RestApi that the node does not offer as an operation. The node itself does not send the request. n8n points you to the **HTTP Request** node instead. In the HTTP Request node, set **Authentication** to **Predefined Credential Type** and **Credential Type** to **Ipt RestApi2 API**, then select your credential. The request then carries the same four headers as this node. The base URL is not taken from the credential, so enter the full URL including `/ipt/api`, for example `https://example.com/instance/ipt/api/info`.

## Credentials

The node signs in without a session. Every request carries the API key and the target database as headers. You need an access point with an API key in the ipt RestApi2 add-in of your myfactory installation.

| Field    | Header     | Description                                                                                                                                     |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL |            | URL of the myfactory instance, for example `https://example.com/instance`. Do not add `/ipt/api`, the node does that. A trailing slash is fine. |
| API Key  | `GUID`     | API key of the RestApi2 access point. Stored as a password.                                                                                     |
| App Name | `APPNAME`  | AppName of the myfactory instance, as set in the myfactory administrator. This is not the name of your own application.                         |
| Database | `DB`       | Name of the myfactory client database.                                                                                                          |
| Division | `DIVISION` | Number of the myfactory division, for example `1`.                                                                                              |

When you save the credential, n8n calls `GET /ipt/api/info`. The test fails if the API key, database or division is wrong, and also if the add-in has no valid license.

## Compatibility

- Requires ipt RestApi2 29.12.0 or later (the `fields` parameter was added in that version).
- The option Include needs ipt RestApi2 31.0.5 or later. Older versions ignore attributes and history and return variants and multiple EANs as empty lists.
- Some sales order actions need a later version: Create Purchase Order 32.1.0, Set Printed 34.5.0, Renumber Positions 57.9.0.
- Some purchase order actions need a later version: Confirm Delivery Dates and Set Completed 31.8.0, Set Printed 34.5.0, Renumber Positions 57.9.0, Transform 57.18.0.
- Options > Clause needs ipt RestApi2 29.13.1 or later. Older versions ignore a rejected clause and return unfiltered results.
- Table Data needs ipt RestApi2 34.6.1 or later. Older versions return the rows without their columns. From 57.5.1 on, the read right `TableDatas` can be set in the rights of the access point and the tables of the interface itself are blocked.
- The field `PosIndex` of sales and purchase order positions needs ipt RestApi2 57.9.0 or later: in lists, and to insert a position at a given place (Create) or move it (Update).
- Support Mail and Include Mail for support case positions need ipt RestApi2 57.35.0 or later.
- Options > Changed Since needs ipt RestApi2 57.41.0 or later.
- Update of a support case adds history entries and checks `ContactID` and `HandlingUser` from ipt RestApi2 57.36.1 on. The rules for Create and Update of support case positions described above apply from 52.0.0 on.
- Address Group needs ipt RestApi2 57.23.0 or later.
- Built with `@n8n/node-cli` 0.54.4 and `n8n-workflow` 2.45. Not yet tested against specific n8n versions.

## Usage

Example: read the first 50 products, sorted by product number, with only three fields.

1. Add the **ipt RestApi2** node and select the credential.
2. Set **Resource** to **Product** and **Operation** to **Get Many**.
3. Leave **Return All** off and keep **Limit** at 50.
4. Under **Options**, set **Fields** to `ProductID,ProductNumber,Matchcode` and **Sort** to `ProductNumber`.

The node calls `GET /ipt/api/products` with the query parameters `pagesize=50`, `fields=ProductID,ProductNumber,Matchcode` and `sort=ProductNumber` and returns one item per product.

## Example workflows

Two small workflows that show how the output of one node feeds the next. Both start with a **Manual Trigger** node, and every **ipt RestApi2** node uses the same credential. The values are examples. Replace them with values of your installation.

**Create a customer group and change it**

1. Add an **ipt RestApi2** node. Set **Resource** to **Customer Group** and **Operation** to **Create**. Enter in **Data**:

   ```json
   { "CustomerGroupName": "WHOLESALE", "CustomerGroupDesc": "Wholesale customers" }
   ```

   The node returns the new customer group as one item, including `CustomerGroupName`.

2. Add a second **ipt RestApi2** node after it. Set **Resource** to **Customer Group** and **Operation** to **Update**.
3. Set **Customer Group Name** to the expression `{{ $json.CustomerGroupName }}`, so it takes the key from the output of the Create node.
4. Enter in **Data** only the fields to change, without the key:

   ```json
   { "CustomerGroupDesc": "Wholesale and export customers" }
   ```

   A `CustomerGroupName` in Data would rename the customer group, see **Master data: lookup lists** under [Operations](#operations).

**Delete a customer**

1. Add an **ipt RestApi2** node to find the customer. Set **Resource** to **Customer** and **Operation** to **Get Many**. Under **Options > Filters**, add a filter with **Field Name** `CustomerNumber` and **Value** `10001`.
2. Add a second **ipt RestApi2** node after it. Set **Resource** to **Customer** and **Operation** to **Delete**. Leave **Delete Multiple** off.
3. Set **Customer ID** to the expression `{{ $json.CustomerID }}`.

The node returns one item `{"deleted": true, "CustomerID": 1234}`. Before you run it, read Delete under **Customer** in [Operations](#operations): depending on a myfactory setting, the address of the customer is deleted too, and a customer that is still in use cannot be deleted.

## Using the node as an AI agent tool

The node can be attached to an AI Agent node as a tool.

- **One tool node per operation.** Resource and operation are fixed for each tool node. Add one node for "Get many products", another for "Update product", and so on.
- **IDs as parameters.** The ID parameters are Product ID (`productId`), Address ID (`addressId`), Contact ID (`contactId`), Customer ID (`customerId`), Supplier ID (`supplierId`), Sales Order ID (`salesOrderId`, also for the sales order actions except Transform), Sales Order Position ID (`salesOrderPosId`), Purchase Order ID (`purchaseOrderId`, also for the purchase order actions except Transform), Purchase Order Position ID (`purchaseOrderPosId`), Support Case ID (`supportCaseId`), Support Case Position ID (`supportCasePosId`), Support Mail ID (`supportMailId`) and Document ID (`documentId`, for Download Attachment). The master data lookup lists use Unit Name (`unitName`), Weight Unit Name (`weightUnitName`), Product Group Name (`productGroupName`), Customer Group Name (`customerGroupName`), Supplier Group Name (`supplierGroupName`), Contact Group Name (`contactGroupName`), Address Group Name (`addressGroupName`), Country ID (`countryId`), Currency Unit (`currencyUnit`), Shipment Condition Name (`shipmentConditionName`) and Delivery Condition Name (`deliveryConditionName`), all text keys, and the numeric Product State ID (`productStateId`), Product Type ID (`productTypeId`), Manufacturer ID (`manufacturerId`) and Payment Condition ID (`paymentConditionId`). Transform uses Source Order ID (`sourceOrderId`) and Target Order Type (`targetOrderType`) for sales and purchase orders.
- **Tool description.** The parameter **Tool Description** appears only when the node is attached to an AI Agent as a tool (n8n then uses the tool variant of the node). The regular node does not have it. The model does not see the descriptions of the node's operations and parameters. It sees only this text and, for each parameter filled with `$fromAI`, the description given there.
  - **Set Automatically** (default): n8n builds the description from the action of the operation and the default node name, for example "Get many contacts from myfactory in ipt RestApi2".
  - **Set Manually**: your own text in **Description**. Use it as soon as an agent has several similar tools, for example several Get Many tools. Say what the tool returns, which fields it returns (with Simplify), how many records one call returns at most (Limit) and when another tool is the better choice.
  - Example for Contact > Get Many with Simplify on and Limit 25:

    ```
    Searches contact persons in the myfactory ERP. Returns at most 25 contacts per call, each with ContactID, AddressID, ContactNumber, Matchcode, FirstName, LastName, EMail, PhoneNr, MobilePhone and InActive. Use it to find a contact by name or e-mail address. To read the company of a contact, use the address tool with the AddressID.
    ```

    Clause for this tool: `{{ $fromAI("clause", "SQL condition on contact fields such as LastName, EMail or AddressID. Write = as $EQ$ and % as $P100$, for example LastName LIKE '$P100$Smith$P100$'. Leave empty for no condition.", "string") }}`

- **Let the model fill parameters with `$fromAI`.**
  - Product ID: `{{ $fromAI("productId", "Numeric ProductID of the product", "number") }}`
  - For agents, Data with a single `$fromAI` is the simple way to write records. Fields is meant for setting up the node in the editor.
  - Data: `{{ $fromAI("data", "Fields to write as a JSON object. Use myfactory field names such as Matchcode, Name1, BaseUnit or ProductGroup. A new product needs Matchcode, BaseUnit, BaseDecimals and ProductGroup.", "json") }}`
  - Data for a new customer: `{{ $fromAI("data", "Fields of the new customer as a JSON object. AddressID is required: create the address first with the address tool and use the AddressID it returns.", "json") }}`
  - Data for a new sales order: `{{ $fromAI("data", "Fields of the new sales order as a JSON object. OrderType and CustomerNumber are required. Positions is an array of objects with ProductNumber and Quantity.", "json") }}`
  - Data for a new purchase order: `{{ $fromAI("data", "Fields of the new purchase order as a JSON object. OrderType and SupplierNumber are required. Positions is an array of objects with ProductNumber and Quantity.", "json") }}`
  - Purchase Order ID for an action: `{{ $fromAI("purchaseOrderId", "OrderID of the purchase order, not the order number. Get it with the tool for Get Many purchase orders.", "number") }}`
  - Clause for Get Many sales orders: `{{ $fromAI("clause", "SQL condition on sales order fields such as BookingDate, OrderType or CustomerNumber. Write = as $EQ$, < as $LT$, > as $GT$, >= as $GT$$EQ$ and % as $P100$. Write dates as 'yyyyMMdd', for example BookingDate$GT$$EQ$'20261001' AND BookingDate$LT$'20261101'. No long IN lists, use a range such as OrderID$GT$5000 instead. Leave empty for no condition.", "string") }}`. If the model leaves Clause or Fields out, the node sends no condition or field list.
  - Filter value for Get Many sales order positions, with the filter field `ProductNumber`: `{{ $fromAI("productNumber", "Product number to find the sales order positions of", "string") }}`. The positions show in which sales orders (`OrderID`) the product was sold.
  - Sales Order ID for an action: `{{ $fromAI("salesOrderId", "OrderID of the sales order, not the order number. Get it with the tool for Get Many sales orders.", "number") }}`
  - Source Order ID for Transform: `{{ $fromAI("sourceOrderId", "OrderID of the sales order to transform, not the order number", "number") }}`
  - Position IDs for Create Purchase Order: `{{ $fromAI("positionIds", "Comma-separated OrderPosID values of the sales order positions to order, for example 5678,5679", "string") }}`
  - Currency for Change Currency: `{{ $fromAI("currency", "Currency code set up in myfactory, for example USD", "string") }}`
- **The agent cannot look up order types.** The node has no resource for them. Set Target Order Type and Purchase Order Type as fixed values in the tool node, or list the allowed values of your installation with their meaning in the tool description. Currencies, units, product groups, countries, payment conditions and the other master data lookup lists can be read with a Get Many tool of their resource. Suppliers can be looked up with a tool for Get Many suppliers. Their names are fields of the address (`AddressID`), so the agent needs a tool for addresses too, or a fixed Supplier ID.
- **Master data lookup lists for valid values.** Give the agent a Get Many tool for a lookup list, with Simplify on, so it can find the right key before it writes a product, an address or a customer. A text key for Get is filled like `{{ $fromAI("unitName", "Short name of the unit, for example kg", "string") }}`. Tell the agent in the description of an Update tool never to send the key field in Data, because that renames the record and leaves the records that use the old key pointing to nothing.
- **The model does the math.** The API returns records, not totals. For a question like "What was the turnover in October?" the model reads the sales orders of that month and adds up `OrderSum` itself. Use Simplify or Fields so that it reads only the fields it needs, and set a Limit that covers the expected number of records. With too low a limit the sum is wrong without notice.
- **Tell the agent the order of steps.** A customer needs an existing address. Give the agent a tool to create addresses and one to create customers, and say in the system message or the tool description that it must create the address first and pass the returned `AddressID` to the customer. A sales order needs an existing customer and the number of an order type of your installation. Name the order type in the tool description, because the agent cannot look it up. The same applies to suppliers and purchase orders.
- **Keep the output small.** The tool output goes to the model as JSON and counts against its context window. Turn **Simplify** on and keep **Limit** low, for example 10 to 20. Avoid **Return All** and **All Data** in tool nodes, because a list with all fields can exceed the context window. All Data is off by default for Create, which keeps the output small. Turn it on only if the agent needs all fields of the new record. Sales orders are large: Get, Create (with or without All Data), Update and most sales order actions (Change Currency, Change Customer, Copy, Recalculate, Refresh Prices, Renumber Positions, Transform) return every position. Use Simplify for Get if the agent does not need the positions. For lists of sales orders, Simplify still makes the API load all details of each order, so keep the Limit small. The same applies to purchase orders and their actions that return the order (Change Currency, Change Supplier, Copy, Recalculate, Refresh Prices, Renumber Positions, Transform).
- **Changed Since answers "what changed?"** With Changed Since the tool returns one item with `ChangedUntil`, `HasMore` and `Records`, also when nothing changed. Let the model fill it with `{{ $fromAI("changedSince", "Return records created or changed since this time, for example 2026-11-01T08:00:00. Leave empty for no time limit.", "string") }}`. Keep Simplify on. If `HasMore` is `true`, more records changed than Limit allows, and the model does not see the rest. Say in the tool description that the result is then incomplete.
- **Support mails can be large.** For an agent that reads mails, use Get Many with Simplify and without Include Content to find the mails, and a Get tool to read the text of one mail. Get always returns the HTML part too. Download Attachment returns the file as binary data, which the agent cannot read, so use it in regular workflow steps instead.
- **Support cases need their own IDs and texts.** A new support case needs the `AddressID`, and a `ContactID` must be a contact of that address, so give the agent tools for addresses and contacts. Tell it to send a meaningful `CaseDesc`. A position needs the ID of an action type of your installation as `PosType`: name the allowed values in the tool description.
- **Table Data reads any table.** Set Table as a fixed value in the tool node and name the table and its meaning in the tool description, so the agent reads only the table it needs. Rows of myfactory tables often have many columns, so set **Fields** to the columns the agent needs.
- **Give Delete to an agent only with care.** If an agent must delete, require a human approval: n8n can add a [human review step](https://docs.n8n.io/build/integrate-ai/ai-examples/human-in-the-loop-for-tools) in the Tools panel of the AI Agent node, and the delete tool is attached to that step. You can also use an access point without the delete right for agent workflows. Do not give an agent a tool with **Delete Multiple** turned on.
- **Deleting a customer or supplier can delete its address.** Depending on a myfactory setting, myfactory also deletes the address when no other record uses it, as described for Delete under Customer and Supplier in [Operations](#operations). The agent does not know this. Say it in the description of the delete tool, and tell the agent to ask before it deletes a customer or supplier on an address it did not create itself.
- **The same care applies to sales order actions with lasting effects.** Complete, Set Printed, Change Customer (the order gets a new ID), Change Currency, Refresh Prices (overwrites prices entered by hand), Create Purchase Order (orders from a supplier) and Transform (creates a follow-up document) change business data in a way that is hard to undo. Use a human review step for these tools. Check Credit only reads data. For purchase orders the same applies to Change Supplier (the order gets a new ID), Change Currency, Confirm Delivery Dates (changes the material planning), Refresh Prices (overwrites prices entered by hand), Set Completed, Set Printed and Transform (a goods receipt books stock at once).
- **Leave On Error at its default.** With "Continue" the agent may receive an empty result instead of the error message from the API, and cannot react to it.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Every RestApi2 installation documents itself: the Swagger UI at `https://example.com/instance/ipt/api/docs` and the OpenAPI description at `https://example.com/instance/ipt/api/openapi.json`.

## Version history

See [CHANGELOG.md](CHANGELOG.md).
