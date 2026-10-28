# n8n-nodes-ipt-restapi2

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

In n8n, open **Settings > Community Nodes**, select **Install** and enter the package name `n8n-nodes-ipt-restapi2`.

For details, follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

**Product**

- **Create:** create a product (`POST /products`).
  - **Data** holds the fields of the new product as a JSON object, for example `{"Matchcode": "Sample product", "BaseUnit": "pcs", "BaseDecimals": 0, "ProductGroup": "Default"}`. `Matchcode`, `BaseUnit`, `BaseDecimals` and `ProductGroup` are required, unless the access point has a template product in the API configuration. In that case the API takes every missing field except `ProductID` and `ProductNumber` from the template product. Without `ProductNumber` the API takes the next number from the number range in myfactory.
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
- **Update:** change a product by its numeric ID (`PUT /products/{id}`).
  - **Data** holds the fields to change as a JSON object, for example `{"Matchcode": "New name"}`. Fields that are not listed stay unchanged.
  - Installations that require an `If-Match` header for every write are not supported yet. There the API rejects the update with status 428.

Simplify and Fields restrict the response to the named fields. Additional data from Include is then left out.

Each product becomes its own n8n item. Create and Update return the product as stored after the write. Errors returned by the API (for example "Login failed" or "No records found") appear as the error message of the node.

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
- **Tool description.** By default n8n builds the description from the action, for example "Get many products from myfactory in ipt RestApi2". The descriptions of operations and parameters are not passed to the model. Set the tool description manually and say what the tool returns and when to use it, for example: "Searches products in the myfactory ERP. Returns product number, matchcode, name and product group."
- **Let the model fill parameters with `$fromAI`.**
  - Product ID: `{{ $fromAI("productId", "Numeric ProductID of the product", "number") }}`
  - Data: `{{ $fromAI("data", "Fields to write as a JSON object. Use myfactory field names such as Matchcode, Name1, BaseUnit or ProductGroup. A new product needs Matchcode, BaseUnit, BaseDecimals and ProductGroup.", "json") }}`
- **Keep the output small.** The tool output goes to the model as JSON and counts against its context window. Turn **Simplify** on and keep **Limit** low, for example 10 to 20. Avoid **Return All** and **All Data** in tool nodes, because a product list with all fields can exceed the context window.
- **Leave On Error at its default.** With "Continue" the agent may receive an empty result instead of the error message from the API, and cannot react to it.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Every RestApi2 installation documents itself: the Swagger UI at `https://example.com/instance/ipt/api/docs` and the OpenAPI description at `https://example.com/instance/ipt/api/openapi.json`.

## Version history

See [CHANGELOG.md](CHANGELOG.md).
