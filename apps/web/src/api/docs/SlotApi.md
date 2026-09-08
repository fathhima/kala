# SlotApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**slotControllerCreateException**](#slotcontrollercreateexception) | **POST** /api/instructor/availability/exceptions | |
|[**slotControllerCreateRule**](#slotcontrollercreaterule) | **POST** /api/instructor/availability/rules | |
|[**slotControllerDisableRule**](#slotcontrollerdisablerule) | **DELETE** /api/instructor/availability/rules/{ruleId} | |
|[**slotControllerGetPublicAvailability**](#slotcontrollergetpublicavailability) | **GET** /api/public/instructors/{profileId}/availability | |
|[**slotControllerListInstructorAvailability**](#slotcontrollerlistinstructoravailability) | **GET** /api/instructor/availability | |
|[**slotControllerUpdateRule**](#slotcontrollerupdaterule) | **PATCH** /api/instructor/availability/rules/{ruleId} | |

# **slotControllerCreateException**
> slotControllerCreateException(createSlotExceptionDto)


### Example

```typescript
import {
    SlotApi,
    Configuration,
    CreateSlotExceptionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

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

# **slotControllerCreateRule**
> slotControllerCreateRule(createSlotRuleDto)


### Example

```typescript
import {
    SlotApi,
    Configuration,
    CreateSlotRuleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

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

# **slotControllerDisableRule**
> slotControllerDisableRule()


### Example

```typescript
import {
    SlotApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

let ruleId: string; // (default to undefined)

const { status, data } = await apiInstance.slotControllerDisableRule(
    ruleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ruleId** | [**string**] |  | defaults to undefined|


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

# **slotControllerGetPublicAvailability**
> slotControllerGetPublicAvailability()


### Example

```typescript
import {
    SlotApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

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

# **slotControllerListInstructorAvailability**
> slotControllerListInstructorAvailability()


### Example

```typescript
import {
    SlotApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

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

# **slotControllerUpdateRule**
> slotControllerUpdateRule(updateSlotRuleDto)


### Example

```typescript
import {
    SlotApi,
    Configuration,
    UpdateSlotRuleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlotApi(configuration);

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

