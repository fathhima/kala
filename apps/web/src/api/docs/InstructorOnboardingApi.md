# InstructorOnboardingApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**instructorControllerAddOffering**](#instructorcontrolleraddoffering) | **POST** /api/instructor/onboarding/offerings | Create an instructor offering|
|[**instructorControllerCancelApplication**](#instructorcontrollercancelapplication) | **POST** /api/instructor/onboarding/applications/{applicationId}/cancel | Cancel the current pending instructor application|
|[**instructorControllerConfirmMediaUpload**](#instructorcontrollerconfirmmediaupload) | **POST** /api/instructor/onboarding/offerings/{offeringId}/media/confirm | Confirm offering media upload|
|[**instructorControllerCreateMediaUploadUrl**](#instructorcontrollercreatemediauploadurl) | **POST** /api/instructor/onboarding/offerings/{offeringId}/media/upload-url | Create offering media upload URL|
|[**instructorControllerGetInstructor**](#instructorcontrollergetinstructor) | **GET** /api/instructor/onboarding/{profileId} | Get one approved instructor profile|
|[**instructorControllerGetMediaViewUrl**](#instructorcontrollergetmediaviewurl) | **GET** /api/instructor/onboarding/offerings/{offeringId}/media/{mediaId}/view-url | Get offering media view URL|
|[**instructorControllerGetWorkspace**](#instructorcontrollergetworkspace) | **GET** /api/instructor/onboarding | Get instructor onboarding workspace|
|[**instructorControllerRemoveMedia**](#instructorcontrollerremovemedia) | **DELETE** /api/instructor/onboarding/offerings/{offeringId}/media/{mediaId} | Remove offering media|
|[**instructorControllerRemoveOffering**](#instructorcontrollerremoveoffering) | **DELETE** /api/instructor/onboarding/offerings/{offeringId} | Remove an instructor offering|
|[**instructorControllerSaveProfile**](#instructorcontrollersaveprofile) | **PATCH** /api/instructor/onboarding/profile | Create or update instructor profile|
|[**instructorControllerSubmitApplication**](#instructorcontrollersubmitapplication) | **POST** /api/instructor/onboarding/submit | Submit instructor application|
|[**instructorControllerUpdateOffering**](#instructorcontrollerupdateoffering) | **PATCH** /api/instructor/onboarding/offerings/{offeringId} | Update an instructor offering|

# **instructorControllerAddOffering**
> InstructorOfferingResponseDto instructorControllerAddOffering(createOfferingDto)


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration,
    CreateOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let createOfferingDto: CreateOfferingDto; //

const { status, data } = await apiInstance.instructorControllerAddOffering(
    createOfferingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOfferingDto** | **CreateOfferingDto**|  | |


### Return type

**InstructorOfferingResponseDto**

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

# **instructorControllerCancelApplication**
> MessageResponseDto instructorControllerCancelApplication()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let applicationId: string; // (default to undefined)

const { status, data } = await apiInstance.instructorControllerCancelApplication(
    applicationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **applicationId** | [**string**] |  | defaults to undefined|


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

# **instructorControllerConfirmMediaUpload**
> OfferingMediaResponseDto instructorControllerConfirmMediaUpload(confirmOfferingMediaUploadDto)


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration,
    ConfirmOfferingMediaUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)
let confirmOfferingMediaUploadDto: ConfirmOfferingMediaUploadDto; //

const { status, data } = await apiInstance.instructorControllerConfirmMediaUpload(
    offeringId,
    confirmOfferingMediaUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **confirmOfferingMediaUploadDto** | **ConfirmOfferingMediaUploadDto**|  | |
| **offeringId** | [**string**] |  | defaults to undefined|


### Return type

**OfferingMediaResponseDto**

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

# **instructorControllerCreateMediaUploadUrl**
> PresignedUploadResponseDto instructorControllerCreateMediaUploadUrl(requestOfferingMediaUploadDto)


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration,
    RequestOfferingMediaUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)
let requestOfferingMediaUploadDto: RequestOfferingMediaUploadDto; //

const { status, data } = await apiInstance.instructorControllerCreateMediaUploadUrl(
    offeringId,
    requestOfferingMediaUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestOfferingMediaUploadDto** | **RequestOfferingMediaUploadDto**|  | |
| **offeringId** | [**string**] |  | defaults to undefined|


### Return type

**PresignedUploadResponseDto**

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

# **instructorControllerGetInstructor**
> PublicInstructorResponseDto instructorControllerGetInstructor()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let profileId: string; // (default to undefined)

const { status, data } = await apiInstance.instructorControllerGetInstructor(
    profileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileId** | [**string**] |  | defaults to undefined|


### Return type

**PublicInstructorResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Instructor not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **instructorControllerGetMediaViewUrl**
> PresignedDownloadResponseDto instructorControllerGetMediaViewUrl()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)
let mediaId: string; // (default to undefined)

const { status, data } = await apiInstance.instructorControllerGetMediaViewUrl(
    offeringId,
    mediaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offeringId** | [**string**] |  | defaults to undefined|
| **mediaId** | [**string**] |  | defaults to undefined|


### Return type

**PresignedDownloadResponseDto**

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

# **instructorControllerGetWorkspace**
> InstructorProfileResponseDto instructorControllerGetWorkspace()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

const { status, data } = await apiInstance.instructorControllerGetWorkspace();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InstructorProfileResponseDto**

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

# **instructorControllerRemoveMedia**
> MessageResponseDto instructorControllerRemoveMedia()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)
let mediaId: string; // (default to undefined)

const { status, data } = await apiInstance.instructorControllerRemoveMedia(
    offeringId,
    mediaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offeringId** | [**string**] |  | defaults to undefined|
| **mediaId** | [**string**] |  | defaults to undefined|


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

# **instructorControllerRemoveOffering**
> MessageResponseDto instructorControllerRemoveOffering()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)

const { status, data } = await apiInstance.instructorControllerRemoveOffering(
    offeringId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offeringId** | [**string**] |  | defaults to undefined|


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

# **instructorControllerSaveProfile**
> InstructorProfileResponseDto instructorControllerSaveProfile(updateInstructorProfileDto)


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration,
    UpdateInstructorProfileDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let updateInstructorProfileDto: UpdateInstructorProfileDto; //

const { status, data } = await apiInstance.instructorControllerSaveProfile(
    updateInstructorProfileDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateInstructorProfileDto** | **UpdateInstructorProfileDto**|  | |


### Return type

**InstructorProfileResponseDto**

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

# **instructorControllerSubmitApplication**
> InstructorApplicationResponseDto instructorControllerSubmitApplication()


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

const { status, data } = await apiInstance.instructorControllerSubmitApplication();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InstructorApplicationResponseDto**

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

# **instructorControllerUpdateOffering**
> InstructorOfferingResponseDto instructorControllerUpdateOffering(updateOfferingDto)


### Example

```typescript
import {
    InstructorOnboardingApi,
    Configuration,
    UpdateOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorOnboardingApi(configuration);

let offeringId: string; // (default to undefined)
let updateOfferingDto: UpdateOfferingDto; //

const { status, data } = await apiInstance.instructorControllerUpdateOffering(
    offeringId,
    updateOfferingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateOfferingDto** | **UpdateOfferingDto**|  | |
| **offeringId** | [**string**] |  | defaults to undefined|


### Return type

**InstructorOfferingResponseDto**

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

