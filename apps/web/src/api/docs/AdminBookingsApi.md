# AdminBookingsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bookingControllerListAdmin**](#bookingcontrollerlistadmin) | **GET** /api/admin/bookings | List all bookings|

# **bookingControllerListAdmin**
> PaginatedBookingsResponseDto bookingControllerListAdmin()


### Example

```typescript
import {
    AdminBookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminBookingsApi(configuration);

let status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'; // (optional) (default to undefined)
let from: string; //Filter by slot startTime >= from (ISO) (optional) (default to undefined)
let to: string; //Filter by slot startTime <= to (ISO) (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.bookingControllerListAdmin(
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
| **status** | [**&#39;PAYMENT_PENDING&#39; | &#39;CONFIRMED&#39; | &#39;COMPLETED&#39; | &#39;EXPIRED&#39; | &#39;CANCELLED&#39;**]**Array<&#39;PAYMENT_PENDING&#39; &#124; &#39;CONFIRMED&#39; &#124; &#39;COMPLETED&#39; &#124; &#39;EXPIRED&#39; &#124; &#39;CANCELLED&#39;>** |  | (optional) defaults to undefined|
| **from** | [**string**] | Filter by slot startTime &gt;&#x3D; from (ISO) | (optional) defaults to undefined|
| **to** | [**string**] | Filter by slot startTime &lt;&#x3D; to (ISO) | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 20|


### Return type

**PaginatedBookingsResponseDto**

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

