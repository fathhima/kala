# PaymentsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**paymentControllerCreateCheckout**](#paymentcontrollercreatecheckout) | **POST** /api/payments/checkout | Create a Razorpay checkout session for a booking|
|[**paymentControllerGetPayment**](#paymentcontrollergetpayment) | **GET** /api/payments/{paymentId} | Get a payment by ID|
|[**paymentControllerGetPaymentByBooking**](#paymentcontrollergetpaymentbybooking) | **GET** /api/payments/booking/{bookingId} | Get payment for a booking|
|[**paymentControllerHandleWebhook**](#paymentcontrollerhandlewebhook) | **POST** /api/payments/webhook | Razorpay webhook endpoint|
|[**paymentControllerListAdminPayments**](#paymentcontrollerlistadminpayments) | **GET** /api/admin/payments | List all payments (admin)|
|[**paymentControllerListStudentPayments**](#paymentcontrollerliststudentpayments) | **GET** /api/payments | List student payments|
|[**paymentControllerRefundPayment**](#paymentcontrollerrefundpayment) | **POST** /api/payments/booking/{bookingId}/refund | Refund a payment (admin only)|

# **paymentControllerCreateCheckout**
> CheckoutResponseDto paymentControllerCreateCheckout(createCheckoutDto)


### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    CreateCheckoutDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let createCheckoutDto: CreateCheckoutDto; //

const { status, data } = await apiInstance.paymentControllerCreateCheckout(
    createCheckoutDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCheckoutDto** | **CreateCheckoutDto**|  | |


### Return type

**CheckoutResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerGetPayment**
> PaymentResponseDto paymentControllerGetPayment()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerGetPayment(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**PaymentResponseDto**

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

# **paymentControllerGetPaymentByBooking**
> PaymentResponseDto paymentControllerGetPaymentByBooking()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerGetPaymentByBooking(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**PaymentResponseDto**

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

# **paymentControllerHandleWebhook**
> paymentControllerHandleWebhook()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let xRazorpaySignature: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerHandleWebhook(
    xRazorpaySignature
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xRazorpaySignature** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerListAdminPayments**
> PaginatedPaymentsResponseDto paymentControllerListAdminPayments()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

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

# **paymentControllerListStudentPayments**
> PaginatedPaymentsResponseDto paymentControllerListStudentPayments()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED'; // (optional) (default to undefined)
let from: string; //Filter by createdAt >= from (ISO) (optional) (default to undefined)
let to: string; //Filter by createdAt <= to (ISO) (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.paymentControllerListStudentPayments(
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
    PaymentsApi,
    Configuration,
    RefundPaymentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

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

