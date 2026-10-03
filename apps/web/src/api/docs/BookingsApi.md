# BookingsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bookingControllerCancel**](#bookingcontrollercancel) | **POST** /api/bookings/{bookingId}/cancel | Cancel a pending hold or confirmed session and release the slot|
|[**bookingControllerComplete**](#bookingcontrollercomplete) | **POST** /api/instructor/bookings/{bookingId}/complete | Mark a confirmed session as completed after it ends|
|[**bookingControllerGetById**](#bookingcontrollergetbyid) | **GET** /api/bookings/{bookingId} | Get a booking by id (student, instructor, or admin)|
|[**bookingControllerHold**](#bookingcontrollerhold) | **POST** /api/bookings | Hold a slot for 10 minutes pending payment|
|[**bookingControllerListAdmin**](#bookingcontrollerlistadmin) | **GET** /api/admin/bookings | List all bookings|
|[**bookingControllerListInstructor**](#bookingcontrollerlistinstructor) | **GET** /api/instructor/bookings | List bookings for the current instructor|
|[**bookingControllerListStudent**](#bookingcontrollerliststudent) | **GET** /api/bookings | List current student bookings|

# **bookingControllerCancel**
> BookingResponseDto bookingControllerCancel(cancelBookingDto)


### Example

```typescript
import {
    BookingsApi,
    Configuration,
    CancelBookingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

let bookingId: string; // (default to undefined)
let cancelBookingDto: CancelBookingDto; //

const { status, data } = await apiInstance.bookingControllerCancel(
    bookingId,
    cancelBookingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cancelBookingDto** | **CancelBookingDto**|  | |
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**BookingResponseDto**

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

# **bookingControllerComplete**
> BookingResponseDto bookingControllerComplete()


### Example

```typescript
import {
    BookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

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

# **bookingControllerGetById**
> BookingResponseDto bookingControllerGetById()


### Example

```typescript
import {
    BookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.bookingControllerGetById(
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

# **bookingControllerHold**
> BookingResponseDto bookingControllerHold(createBookingDto)


### Example

```typescript
import {
    BookingsApi,
    Configuration,
    CreateBookingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

let idempotencyKey: string; // (default to undefined)
let createBookingDto: CreateBookingDto; //

const { status, data } = await apiInstance.bookingControllerHold(
    idempotencyKey,
    createBookingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBookingDto** | **CreateBookingDto**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**BookingResponseDto**

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

# **bookingControllerListAdmin**
> PaginatedBookingsResponseDto bookingControllerListAdmin()


### Example

```typescript
import {
    BookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

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

# **bookingControllerListInstructor**
> PaginatedBookingsResponseDto bookingControllerListInstructor()


### Example

```typescript
import {
    BookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

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

# **bookingControllerListStudent**
> PaginatedBookingsResponseDto bookingControllerListStudent()


### Example

```typescript
import {
    BookingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BookingsApi(configuration);

let status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'; // (optional) (default to undefined)
let from: string; //Filter by slot startTime >= from (ISO) (optional) (default to undefined)
let to: string; //Filter by slot startTime <= to (ISO) (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.bookingControllerListStudent(
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

