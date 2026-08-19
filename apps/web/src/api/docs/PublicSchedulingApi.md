# PublicSchedulingApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**publicSchedulingControllerGetAvailability**](#publicschedulingcontrollergetavailability) | **GET** /api/public/instructors/{profileId}/availability | |

# **publicSchedulingControllerGetAvailability**
> publicSchedulingControllerGetAvailability()


### Example

```typescript
import {
    PublicSchedulingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicSchedulingApi(configuration);

let profileId: string; // (default to undefined)
let offeringId: string; // (default to undefined)
let date: string; // (default to undefined)

const { status, data } = await apiInstance.publicSchedulingControllerGetAvailability(
    profileId,
    offeringId,
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileId** | [**string**] |  | defaults to undefined|
| **offeringId** | [**string**] |  | defaults to undefined|
| **date** | [**string**] |  | defaults to undefined|


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

