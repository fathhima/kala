# AdminPaymentsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**paymentControllerListAdminPayments**](#paymentcontrollerlistadminpayments) | **GET** /api/admin/payments | List all payments (admin)|
|[**paymentControllerRefundPayment**](#paymentcontrollerrefundpayment) | **POST** /api/payments/booking/{bookingId}/refund | Refund a payment (admin only)|

# **paymentControllerListAdminPayments**
> PaginatedPaymentsResponseDto paymentControllerListAdminPayments()


### Example

```typescript
import {
    AdminPaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentsApi(configuration);

let status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED'; // (optional) (default to undefined)
let from: string; //Filter by createdAt >= from (ISO) (optional) (default to undefined)
let to: string; //Filter by createdAt <= to (ISO) (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.paymentControllerListAdminPayments(
    status,
    from,
    to,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**&#39;PENDING&#39; | &#39;PROCESSING&#39; | &#39;SUCCEEDED&#39; | &#39;FAILED&#39; | &#39;REFUND_PENDING&#39; | &#39;REFUNDED&#39; | &#39;PARTIALLY_REFUNDED&#39;**]**Array<&#39;PENDING&#39; &#124; &#39;PROCESSING&#39; &#124; &#39;SUCCEEDED&#39; &#124; &#39;FAILED&#39; &#124; &#39;REFUND_PENDING&#39; &#124; &#39;REFUNDED&#39; &#124; &#39;PARTIALLY_REFUNDED&#39;>** |  | (optional) defaults to undefined|
| **from** | [**string**] | Filter by createdAt &gt;&#x3D; from (ISO) | (optional) defaults to undefined|
| **to** | [**string**] | Filter by createdAt &lt;&#x3D; to (ISO) | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 20|


### Return type

**PaginatedPaymentsResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerRefundPayment**
> PaymentResponseDto paymentControllerRefundPayment(refundPaymentDto)


### Example

```typescript
import {
    AdminPaymentsApi,
    Configuration,
    RefundPaymentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentsApi(configuration);

let bookingId: string; // (default to undefined)
let refundPaymentDto: RefundPaymentDto; //

const { status, data } = await apiInstance.paymentControllerRefundPayment(
    bookingId,
    refundPaymentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundPaymentDto** | **RefundPaymentDto**|  | |
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**PaymentResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

