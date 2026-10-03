# InstructorBookingsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bookingControllerComplete**](#bookingcontrollercomplete) | **POST** /api/instructor/bookings/{bookingId}/complete | Mark a confirmed session as completed after it ends|
|[**bookingControllerListInstructor**](#bookingcontrollerlistinstructor) | **GET** /api/instructor/bookings | List bookings for the current instructor|

# **bookingControllerComplete**
> BookingResponseDto bookingControllerComplete()


### Example

```typescript
import {
    InstructorBookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorBookingsApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.bookingControllerComplete(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**BookingResponseDto**

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

# **bookingControllerListInstructor**
> PaginatedBookingsResponseDto bookingControllerListInstructor()


### Example

```typescript
import {
    InstructorBookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorBookingsApi(configuration);

let status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'; // (optional) (default to undefined)
let from: string; //Filter by slot startTime >= from (ISO) (optional) (default to undefined)
let to: string; //Filter by slot startTime <= to (ISO) (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.bookingControllerListInstructor(
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

