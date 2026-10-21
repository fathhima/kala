# VideoCallApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**videoCallControllerGetIceServers**](#videocallcontrollergeticeservers) | **GET** /api/video-call/ice-servers | Get current STUN/TURN ICE server configuration|
|[**videoCallControllerGetSessionAccess**](#videocallcontrollergetsessionaccess) | **GET** /api/video-call/sessions/{bookingId}/access | Check session eligibility, timing windows, partner details, and ICE config|

# **videoCallControllerGetIceServers**
> Array<IceServerConfigDto> videoCallControllerGetIceServers()


### Example

```typescript
import {
    VideoCallApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideoCallApi(configuration);

const { status, data } = await apiInstance.videoCallControllerGetIceServers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<IceServerConfigDto>**

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

# **videoCallControllerGetSessionAccess**
> VideoSessionAccessDto videoCallControllerGetSessionAccess()


### Example

```typescript
import {
    VideoCallApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideoCallApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.videoCallControllerGetSessionAccess(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**VideoSessionAccessDto**

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

