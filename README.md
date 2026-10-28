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

- **Get:** get a single product by its numeric ID (`GET /products/{id}`).
- **Get Many:** get a list of products (`GET /products`).
  - **Return All** reads every page. The node requests pages of 1000 products, the largest page size the API allows.
  - **Limit** returns at most the given number of products (1 to 1000).
  - **Options > Fields** limits the response to the listed fields, for example `ProductID,ProductNumber,Matchcode`.
  - **Options > Sort** sorts the list, for example `-ChangeDate,Matchcode`. A leading minus sorts in descending order.

Each product becomes its own n8n item. Errors returned by the API (for example "Login failed" or "No records found") appear as the error message of the node.

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
- Built with `@n8n/node-cli` 0.54.4 and `n8n-workflow` 2.45. Not yet tested against specific n8n versions.

## Usage

Example: read the first 50 products, sorted by product number, with only three fields.

1. Add the **ipt RestApi2** node and select the credential.
2. Set **Resource** to **Product** and **Operation** to **Get Many**.
3. Leave **Return All** off and keep **Limit** at 50.
4. Under **Options**, set **Fields** to `ProductID,ProductNumber,Matchcode` and **Sort** to `ProductNumber`.

The node calls `GET /ipt/api/products` with the query parameters `pagesize=50`, `fields=ProductID,ProductNumber,Matchcode` and `sort=ProductNumber` and returns one item per product.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Every RestApi2 installation documents itself: the Swagger UI at `https://example.com/instance/ipt/api/docs` and the OpenAPI description at `https://example.com/instance/ipt/api/openapi.json`.

## Version history

See [CHANGELOG.md](CHANGELOG.md).
