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
[Resources](#resources)
[Version history](#version-history)

## Installation

In n8n, open **Settings > Community Nodes**, select **Install** and enter the package name `@ipt-solution/n8n-nodes-ipt-restapi2`.

For details, follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The node offers the resources Address, Customer, Product, Purchase Order, Purchase Order Position, Sales Order, Sales Order Position and Supplier. Each resource has the operations Create, Delete, Get, Get Many and Update. Sales Order and Purchase Order also have actions such as Copy, Transform or Recalculate. Product is described in full below. The other resources work the same way, their sections list only what differs. In the API documentation (Swagger UI) these endpoints are listed under Products, Addresses & Contacts, Customers & Suppliers, Sales and Purchase. The resource Table Data reads any table or view of the client database and has only Get Many.

**Product**

- **Create:** create a product (`POST /products`).
  - **Data** holds the fields of the new product as a JSON object. `Matchcode`, `BaseUnit`, `BaseDecimals` and `ProductGroup` are required, unless the access point has a template product in the API configuration. In that case the API takes every missing field except `ProductID` and `ProductNumber` from the template product. Without `ProductNumber` the API takes the next number from the number range in myfactory.
  - `BaseUnit` and `ProductGroup` must exist in myfactory. Replace `Stk` and `Allg.` in the minimal example with a unit and a product group of your installation:

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
  - **Simplify** returns only these fields: `ProductID`, `ProductNumber`, `Matchcode`, `Name1`, `ProductGroup`, `BaseUnit`, `EANNumber`, `InActive`, `ProductState`, `ChangeDate`. Off by default.
  - **Options > Include** loads additional data: attributes, history, multiple EANs, variants.
- **Get Many:** get a list of products (`GET /products`).
  - **Return All** reads every page. The node requests pages of 1000 products, the largest page size the API allows.
  - **Limit** returns at most the given number of products (1 to 1000).
  - **Simplify** returns the same fields as for Get. Off by default.
  - **Options > All Data** returns all fields of each product. Without it the list has the base fields only (`ProductID`, `ProductNumber`, `Matchcode`, `EANNumber`).
  - **Options > Fields** limits the response to the listed fields, for example `ProductID,ProductNumber,Matchcode`. The node then also sends `alldata=true`, so fields other than the base fields are returned too. If Fields is set, it wins over Simplify.
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

**Customer**

- **Create** (`POST /customers`): a customer belongs to an address. Create the address first and pass its ID: `AddressID` is required. Without `CustomerNumber` the API takes the next number from the number range in myfactory. Without `CustomerGroup` it takes the first customer group in alphabetical order, without `CurrencyUnit` the internal currency. With All Data the response has all fields of the new customer, without it only a few. Minimal example, with `1234` standing for the `AddressID` of an existing address:

  ```json
  { "AddressID": 1234 }
  ```

- **Delete** (`DELETE /customers/{id}`): returns `{"deleted": true, "CustomerID": 1234}`. **Delete Multiple** works as for products and returns `CustomerIDs`. As for products, deleting is permanent and a customer that is still in use is refused with status 409 and the reason from myfactory, for example a customer that still has sales documents. If the myfactory setting to delete unused addresses is on, the address of a deleted customer is deleted too, unless another record such as a supplier or prospect still uses it. A later Delete of that address then fails with status 404.
- **Get** and **Get Many** (`GET /customers`): **Simplify** returns `CustomerID`, `CustomerNumber`, `AddressID`, `MatchcodeAdd`, `CustomerGroup`, `CurrencyUnit`, `PaymentConditions`, `IsFreezed`, `InActive`, `ChangeDate`. Name and postal address are fields of the address (`AddressID`). Without All Data a list has the base fields `CustomerID`, `AddressID`, `CustomerNumber`, `MatchcodeAdd`. **Include** loads attributes and history.
- **Update** (`PUT /customers/{id}`): as for products.

**Supplier**

- **Create** (`POST /suppliers`): a supplier belongs to an address. Create the address first and pass its ID: `AddressID` is required. `SupplierGroup` is required too: the short name of a supplier group of your installation, not its description. An empty `SupplierGroup` takes the first supplier group in alphabetical order. Without `SupplierNumber` the API takes the next number from the number range in myfactory, without `CurrencyUnit` the internal currency. A purchase order needs a payment condition: set `PaymentConditions` to the `ConditionID` of a payment condition of your installation. Without it, myfactory takes the payment condition of the supplier group or of one of its parent groups. If none of them has one, Create of a purchase order for this supplier fails with status 400 and a message from myfactory that no payment condition is given. With All Data the response has all fields of the new supplier, without it only a few. Minimal example, with `1234` standing for the `AddressID` of an existing address, `HL` for the short name of a supplier group and `1` for the `ConditionID` of a payment condition:

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

**Table Data**

- **Get Many** (`GET /tabledatas?table=…`): reads the rows of a table or view of the myfactory client database. There is no Get, Create, Update or Delete, because the endpoint is read-only.
  - **Table** is required: the name of a table or view without schema, for example `tdProducts`. The API answers with status 404 if no table or view of that name exists. The tables of the interface itself (`tdIptRestApi2…`, for example API keys and the request log) are not available, the API answers with status 403.
  - If rights are set for the access point in the API configuration, it needs the read right `TableDatas`. Without it the API answers with status 403.
  - Each row becomes one n8n item with the columns of the table as fields.
  - **Return All** and **Limit** work as for products.
  - The API cannot sort this endpoint and reads the rows in no fixed order. Return All over several pages (more than 1000 rows) can therefore skip rows or return a row twice. For large tables, narrow the rows with Clause, for example to a range of IDs, so that the result fits on one page.
  - **Options > Clause** searches the rows, as described under [All resources](#all-resources), with the column names of the table.
  - **Options > Fields** limits the response to the listed columns, for example `ProductID,ProductNumber,Matchcode`. Upper and lower case do not matter, unknown names are ignored. Without Fields each row has all columns.
  - There is no Filters, Sort, Simplify, All Data or Include. Use Clause to search.

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

Simplify and Fields restrict the response to the named fields. Additional data from Include is then left out.

Each record becomes its own n8n item. Create and Update return the record as stored after the write. Which fields Create returns depends on All Data and the resource, see above. Errors returned by the API (for example "Login failed" or "No records found") appear as the error message of the node.

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
- Built with `@n8n/node-cli` 0.54.4 and `n8n-workflow` 2.45. Not yet tested against specific n8n versions.

## Usage

Example: read the first 50 products, sorted by product number, with only three fields.

1. Add the **ipt RestApi2** node and select the credential.
2. Set **Resource** to **Product** and **Operation** to **Get Many**.
3. Leave **Return All** off and keep **Limit** at 50.
4. Under **Options**, set **Fields** to `ProductID,ProductNumber,Matchcode` and **Sort** to `ProductNumber`.

The node calls `GET /ipt/api/products` with the query parameters `pagesize=50`, `fields=ProductID,ProductNumber,Matchcode` and `sort=ProductNumber` and returns one item per product.

## Using the node as an AI agent tool

The node can be attached to an AI Agent node as a tool.

- **One tool node per operation.** Resource and operation are fixed for each tool node. Add one node for "Get many products", another for "Update a product", and so on.
- **IDs as parameters.** The ID parameters are Product ID (`productId`), Address ID (`addressId`), Customer ID (`customerId`), Supplier ID (`supplierId`), Sales Order ID (`salesOrderId`, also for the sales order actions except Transform), Sales Order Position ID (`salesOrderPosId`), Purchase Order ID (`purchaseOrderId`, also for the purchase order actions except Transform) and Purchase Order Position ID (`purchaseOrderPosId`). Transform uses Source Order ID (`sourceOrderId`) and Target Order Type (`targetOrderType`) for sales and purchase orders.
- **Tool description.** By default n8n builds the description from the action, for example "Get many products from myfactory in ipt RestApi2". The descriptions of operations and parameters are not passed to the model. Set the tool description manually and say what the tool returns and when to use it, for example: "Searches products in the myfactory ERP. Returns product number, matchcode, name and product group."
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
- **The agent cannot look up order types or currencies.** The node has no resource for them. Set Target Order Type and Purchase Order Type as fixed values in the tool node, or list the allowed values of your installation with their meaning in the tool description. Suppliers can be looked up with a tool for Get Many suppliers. Their names are fields of the address (`AddressID`), so the agent needs a tool for addresses too, or a fixed Supplier ID.
- **The model does the math.** The API returns records, not totals. For a question like "What was the turnover in October?" the model reads the sales orders of that month and adds up `OrderSum` itself. Use Simplify or Fields so that it reads only the fields it needs, and set a Limit that covers the expected number of records. With too low a limit the sum is wrong without notice.
- **Tell the agent the order of steps.** A customer needs an existing address. Give the agent a tool to create addresses and one to create customers, and say in the system message or the tool description that it must create the address first and pass the returned `AddressID` to the customer. A sales order needs an existing customer and the number of an order type of your installation. Name the order type in the tool description, because the agent cannot look it up. The same applies to suppliers and purchase orders.
- **Keep the output small.** The tool output goes to the model as JSON and counts against its context window. Turn **Simplify** on and keep **Limit** low, for example 10 to 20. Avoid **Return All** and **All Data** in tool nodes, because a list with all fields can exceed the context window. All Data is off by default for Create, which keeps the output small. Turn it on only if the agent needs all fields of the new record. Sales orders are large: Get, Create (with or without All Data), Update and most sales order actions (Change Currency, Change Customer, Copy, Recalculate, Refresh Prices, Renumber Positions, Transform) return every position. Use Simplify for Get if the agent does not need the positions. For lists of sales orders, Simplify still makes the API load all details of each order, so keep the Limit small. The same applies to purchase orders and their actions that return the order (Change Currency, Change Supplier, Copy, Recalculate, Refresh Prices, Renumber Positions, Transform).
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
