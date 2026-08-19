# SchedulingApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**schedulingControllerCancel**](#schedulingcontrollercancel) | **DELETE** /api/instructor/slots/{slotId} | |
|[**schedulingControllerCreate**](#schedulingcontrollercreate) | **POST** /api/instructor/slots/bulk | |
|[**schedulingControllerList**](#schedulingcontrollerlist) | **GET** /api/instructor/slots | |
|[**schedulingControllerUpdate**](#schedulingcontrollerupdate) | **PATCH** /api/instructor/slots/{slotId} | |

# **schedulingControllerCancel**
> schedulingControllerCancel()


### Example

```typescript
import {
    SchedulingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulingApi(configuration);

let slotId: string; // (default to undefined)

const { status, data } = await apiInstance.schedulingControllerCancel(
    slotId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slotId** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **schedulingControllerCreate**
> schedulingControllerCreate(createSlotsDto)


### Example

```typescript
import {
    SchedulingApi,
    Configuration,
    CreateSlotsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulingApi(configuration);

let createSlotsDto: CreateSlotsDto; //

const { status, data } = await apiInstance.schedulingControllerCreate(
    createSlotsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSlotsDto** | **CreateSlotsDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **schedulingControllerList**
> schedulingControllerList()


### Example

```typescript
import {
    SchedulingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulingApi(configuration);

let status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED'; // (optional) (default to undefined)
let from: string; // (optional) (default to undefined)
let to: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.schedulingControllerList(
    status,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**&#39;AVAILABLE&#39; | &#39;BOOKED&#39; | &#39;CANCELLED&#39;**]**Array<&#39;AVAILABLE&#39; &#124; &#39;BOOKED&#39; &#124; &#39;CANCELLED&#39;>** |  | (optional) defaults to undefined|
| **from** | [**string**] |  | (optional) defaults to undefined|
| **to** | [**string**] |  | (optional) defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **schedulingControllerUpdate**
> schedulingControllerUpdate(updateSlotDto)


### Example

```typescript
import {
    SchedulingApi,
    Configuration,
    UpdateSlotDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulingApi(configuration);

let slotId: string; // (default to undefined)
let updateSlotDto: UpdateSlotDto; //

const { status, data } = await apiInstance.schedulingControllerUpdate(
    slotId,
    updateSlotDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSlotDto** | **UpdateSlotDto**|  | |
| **slotId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

