import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { addressDescription } from './resources/address';
import { addressInfo } from './resources/address/get';
import { addressGroupDescription } from './resources/addressGroup';
import { contactDescription } from './resources/contact';
import { contactInfo } from './resources/contact/get';
import { contactGroupDescription } from './resources/contactGroup';
import { countryDescription, countryInfo } from './resources/country';
import { currencyDescription, currencyInfo } from './resources/currency';
import { customerDescription } from './resources/customer';
import { customerInfo } from './resources/customer/get';
import { customerGroupDescription, customerGroupInfo } from './resources/customerGroup';
import { deliveryConditionDescription, deliveryConditionInfo } from './resources/deliveryCondition';
import { manufacturerDescription, manufacturerInfo } from './resources/manufacturer';
import { paymentConditionDescription, paymentConditionInfo } from './resources/paymentCondition';
import { productDescription } from './resources/product';
import { productInfo } from './resources/product/get';
import { productGroupDescription, productGroupInfo } from './resources/productGroup';
import { productStateDescription, productStateInfo } from './resources/productState';
import { productTypeDescription } from './resources/productType';
import { purchaseOrderDescription } from './resources/purchaseOrder';
import { purchaseOrderInfo } from './resources/purchaseOrder/get';
import { purchaseOrderPositionDescription } from './resources/purchaseOrderPosition';
import { purchaseOrderPositionInfo } from './resources/purchaseOrderPosition/get';
import { salesOrderDescription } from './resources/salesOrder';
import { salesOrderInfo } from './resources/salesOrder/get';
import {
	salesOrderContractDescription,
	salesOrderContractInfo,
} from './resources/salesOrderContract';
import { salesOrderContractBatchDescription } from './resources/salesOrderContractBatch';
import {
	salesOrderContractCancellationDescription,
	salesOrderContractCancellationInfo,
} from './resources/salesOrderContractCancellation';
import {
	salesOrderContractOrderDescription,
	salesOrderContractOrderInfo,
} from './resources/salesOrderContractOrder';
import {
	salesOrderContractPauseDescription,
	salesOrderContractPauseInfo,
} from './resources/salesOrderContractPause';
import { salesOrderContractResultDescription } from './resources/salesOrderContractResult';
import {
	salesOrderContractTermDescription,
	salesOrderContractTermInfo,
} from './resources/salesOrderContractTerm';
import {
	salesOrderContractTypeDescription,
	salesOrderContractTypeInfo,
} from './resources/salesOrderContractType';
import { salesOrderPositionDescription } from './resources/salesOrderPosition';
import { salesOrderPositionInfo } from './resources/salesOrderPosition/get';
import { shipmentConditionDescription, shipmentConditionInfo } from './resources/shipmentCondition';
import { supplierDescription } from './resources/supplier';
import { supplierInfo } from './resources/supplier/get';
import { supplierGroupDescription, supplierGroupInfo } from './resources/supplierGroup';
import { supportCaseDescription } from './resources/supportCase';
import { supportCaseInfo } from './resources/supportCase/get';
import { supportCasePositionDescription } from './resources/supportCasePosition';
import { supportCasePositionInfo } from './resources/supportCasePosition/get';
import { supportMailDescription } from './resources/supportMail';
import { tableDataDescription } from './resources/tableData';
import { unitDescription, unitInfo } from './resources/unit';
import { weightUnitDescription, weightUnitInfo } from './resources/weightUnit';
import { writeFieldsLoader } from './shared/write';

export class IptRestApi2 implements INodeType {
	// The Fields parameter of Create and Update loads its field list here
	methods = {
		resourceMapping: {
			getWriteFields: writeFieldsLoader([
				addressInfo,
				contactInfo,
				countryInfo,
				currencyInfo,
				customerInfo,
				customerGroupInfo,
				deliveryConditionInfo,
				manufacturerInfo,
				paymentConditionInfo,
				productInfo,
				productGroupInfo,
				productStateInfo,
				purchaseOrderInfo,
				purchaseOrderPositionInfo,
				salesOrderInfo,
				salesOrderContractInfo,
				salesOrderContractCancellationInfo,
				salesOrderContractOrderInfo,
				salesOrderContractPauseInfo,
				salesOrderContractTermInfo,
				salesOrderContractTypeInfo,
				salesOrderPositionInfo,
				shipmentConditionInfo,
				supplierInfo,
				supplierGroupInfo,
				supportCaseInfo,
				supportCasePositionInfo,
				unitInfo,
				weightUnitInfo,
			]),
		},
	};

	description: INodeTypeDescription = {
		displayName: 'ipt RestApi2',
		name: 'iptRestApi2',
		icon: { light: 'file:iptRestApi2.svg', dark: 'file:iptRestApi2.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read and write myfactory data through the ipt RestApi2 interface',
		defaults: {
			name: 'ipt RestApi2',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'iptRestApi2Api', required: true }],
		requestDefaults: {
			// The credential holds the instance URL, the API path is fixed
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}/ipt/api',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Address Group',
						value: 'addressGroup',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Contact Group',
						value: 'contactGroup',
					},
					{
						name: 'Country',
						value: 'country',
					},
					{
						name: 'Currency',
						value: 'currency',
					},
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Customer Group',
						value: 'customerGroup',
					},
					{
						name: 'Delivery Condition',
						value: 'deliveryCondition',
					},
					{
						name: 'Manufacturer',
						value: 'manufacturer',
					},
					{
						name: 'Payment Condition',
						value: 'paymentCondition',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Product Group',
						value: 'productGroup',
					},
					{
						name: 'Product State',
						value: 'productState',
					},
					{
						name: 'Product Type',
						value: 'productType',
					},
					{
						name: 'Purchase Order',
						value: 'purchaseOrder',
					},
					{
						name: 'Purchase Order Position',
						value: 'purchaseOrderPosition',
					},
					{
						name: 'Sales Order',
						value: 'salesOrder',
					},
					{
						name: 'Sales Order Contract',
						value: 'salesOrderContract',
					},
					{
						name: 'Sales Order Contract Batch',
						value: 'salesOrderContractBatch',
					},
					{
						name: 'Sales Order Contract Cancellation',
						value: 'salesOrderContractCancellation',
					},
					{
						name: 'Sales Order Contract Order',
						value: 'salesOrderContractOrder',
					},
					{
						name: 'Sales Order Contract Pause',
						value: 'salesOrderContractPause',
					},
					{
						name: 'Sales Order Contract Result',
						value: 'salesOrderContractResult',
					},
					{
						name: 'Sales Order Contract Term',
						value: 'salesOrderContractTerm',
					},
					{
						name: 'Sales Order Contract Type',
						value: 'salesOrderContractType',
					},
					{
						name: 'Sales Order Position',
						value: 'salesOrderPosition',
					},
					{
						name: 'Shipment Condition',
						value: 'shipmentCondition',
					},
					{
						name: 'Supplier',
						value: 'supplier',
					},
					{
						name: 'Supplier Group',
						value: 'supplierGroup',
					},
					{
						name: 'Support Case',
						value: 'supportCase',
					},
					{
						name: 'Support Case Position',
						value: 'supportCasePosition',
					},
					{
						name: 'Support Mail',
						value: 'supportMail',
					},
					{
						name: 'Table Data',
						value: 'tableData',
					},
					{
						name: 'Unit',
						value: 'unit',
					},
					{
						name: 'Weight Unit',
						value: 'weightUnit',
					},
				],
				// Product stays the default, because a node without a stored resource falls back to it
				default: 'product',
			},
			...addressDescription,
			...addressGroupDescription,
			...contactDescription,
			...contactGroupDescription,
			...countryDescription,
			...currencyDescription,
			...customerDescription,
			...customerGroupDescription,
			...deliveryConditionDescription,
			...manufacturerDescription,
			...paymentConditionDescription,
			...productDescription,
			...productGroupDescription,
			...productStateDescription,
			...productTypeDescription,
			...purchaseOrderDescription,
			...purchaseOrderPositionDescription,
			...salesOrderDescription,
			...salesOrderContractDescription,
			...salesOrderContractBatchDescription,
			...salesOrderContractCancellationDescription,
			...salesOrderContractOrderDescription,
			...salesOrderContractPauseDescription,
			...salesOrderContractResultDescription,
			...salesOrderContractTermDescription,
			...salesOrderContractTypeDescription,
			...salesOrderPositionDescription,
			...shipmentConditionDescription,
			...supplierDescription,
			...supplierGroupDescription,
			...supportCaseDescription,
			...supportCasePositionDescription,
			...supportMailDescription,
			...tableDataDescription,
			...unitDescription,
			...weightUnitDescription,
		],
	};
}
