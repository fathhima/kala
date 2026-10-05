# SlotsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**slotControllerCreateException**](#slotcontrollercreateexception) | **POST** /api/instructor/availability/exceptions | Create an availability exception|
|[**slotControllerCreateRule**](#slotcontrollercreaterule) | **POST** /api/instructor/availability/rules | Create a new availability rule|
|[**slotControllerDeleteException**](#slotcontrollerdeleteexception) | **DELETE** /api/instructor/availability/exceptions/{exceptionId} | Delete an availability exception|
|[**slotControllerDeleteRule**](#slotcontrollerdeleterule) | **DELETE** /api/instructor/availability/rules/{ruleId} | Delete an availability rule|
|[**slotControllerGetPublicAvailability**](#slotcontrollergetpublicavailability) | **GET** /api/public/instructors/{profileId}/availability | Get public slot availability for an instructor|
|[**slotControllerListInstructorAvailability**](#slotcontrollerlistinstructoravailability) | **GET** /api/instructor/availability | Get instructor availability rules and exceptions|
|[**slotControllerUpdateRule**](#slotcontrollerupdaterule) | **PATCH** /api/instructor/availability/rules/{ruleId} | Update an existing availability rule|

# **slotControllerCreateException**
> SlotExceptionResponseDto slotControllerCreateException(createSlotExceptionDto)


### Example

```typescript
import {
    SlotsApi,
    Configuration,
    CreateSlotExceptionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let createSlotExceptionDto: CreateSlotExceptionDto; //

const { status, data } = await apiInstance.slotControllerCreateException(
    createSlotExceptionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSlotExceptionDto** | **CreateSlotExceptionDto**|  | |


### Return type

**SlotExceptionResponseDto**

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

# **slotControllerCreateRule**
> SlotRuleResponseDto slotControllerCreateRule(createSlotRuleDto)


### Example

```typescript
import {
    SlotsApi,
    Configuration,
    CreateSlotRuleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let createSlotRuleDto: CreateSlotRuleDto; //

const { status, data } = await apiInstance.slotControllerCreateRule(
    createSlotRuleDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSlotRuleDto** | **CreateSlotRuleDto**|  | |


### Return type

**SlotRuleResponseDto**

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

# **slotControllerDeleteException**
> MessageResponseDto slotControllerDeleteException()


### Example

```typescript
import {
    SlotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let exceptionId: string; // (default to undefined)

const { status, data } = await apiInstance.slotControllerDeleteException(
    exceptionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **exceptionId** | [**string**] |  | defaults to undefined|


### Return type

**MessageResponseDto**

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

# **slotControllerDeleteRule**
> MessageResponseDto slotControllerDeleteRule()


### Example

```typescript
import {
    SlotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let ruleId: string; // (default to undefined)

const { status, data } = await apiInstance.slotControllerDeleteRule(
    ruleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ruleId** | [**string**] |  | defaults to undefined|


### Return type

**MessageResponseDto**

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

# **slotControllerGetPublicAvailability**
> PublicSlotListResponseDto slotControllerGetPublicAvailability()


### Example

```typescript
import {
    SlotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let profileId: string; // (default to undefined)
let offeringId: string; // (optional) (default to undefined)
let from: string; // (optional) (default to undefined)
let to: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.slotControllerGetPublicAvailability(
    profileId,
    offeringId,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileId** | [**string**] |  | defaults to undefined|
| **offeringId** | [**string**] |  | (optional) defaults to undefined|
| **from** | [**string**] |  | (optional) defaults to undefined|
| **to** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PublicSlotListResponseDto**

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

# **slotControllerListInstructorAvailability**
> InstructorSlotAvailabilityResponseDto slotControllerListInstructorAvailability()


### Example

```typescript
import {
    SlotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let offeringId: string; // (optional) (default to undefined)
let from: string; // (optional) (default to undefined)
let to: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.slotControllerListInstructorAvailability(
    offeringId,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offeringId** | [**string**] |  | (optional) defaults to undefined|
| **from** | [**string**] |  | (optional) defaults to undefined|
| **to** | [**string**] |  | (optional) defaults to undefined|


### Return type

**InstructorSlotAvailabilityResponseDto**

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

# **slotControllerUpdateRule**
> SlotRuleResponseDto slotControllerUpdateRule(updateSlotRuleDto)


### Example

```typescript
import {
    SlotsApi,
    Configuration,
    UpdateSlotRuleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotsApi(configuration);

let ruleId: string; // (default to undefined)
let updateSlotRuleDto: UpdateSlotRuleDto; //

const { status, data } = await apiInstance.slotControllerUpdateRule(
    ruleId,
    updateSlotRuleDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSlotRuleDto** | **UpdateSlotRuleDto**|  | |
| **ruleId** | [**string**] |  | defaults to undefined|


### Return type

**SlotRuleResponseDto**

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

