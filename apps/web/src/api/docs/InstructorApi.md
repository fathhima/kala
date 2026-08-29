# InstructorApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**instructorControllerAddOffering**](#instructorcontrolleraddoffering) | **POST** /api/instructors/offerings | Create an instructor offering|
|[**instructorControllerCancelApplication**](#instructorcontrollercancelapplication) | **POST** /api/instructors/applications/{applicationId}/cancel | Cancel the current pending instructor application|
|[**instructorControllerConfirmMediaUpload**](#instructorcontrollerconfirmmediaupload) | **POST** /api/instructors/offerings/{offeringId}/media/confirm | Confirm offering media upload|
|[**instructorControllerCreateMediaUploadUrl**](#instructorcontrollercreatemediauploadurl) | **POST** /api/instructors/offerings/{offeringId}/media/upload-url | Create offering media upload URL|
|[**instructorControllerGetInstructor**](#instructorcontrollergetinstructor) | **GET** /api/instructors/{profileId} | Get one approved instructor profile|
|[**instructorControllerGetInstructors**](#instructorcontrollergetinstructors) | **GET** /api/instructors | List approved instructors and offerings|
|[**instructorControllerGetMediaViewUrl**](#instructorcontrollergetmediaviewurl) | **GET** /api/instructors/offerings/{offeringId}/media/{mediaId}/view-url | Get offering media view URL|
|[**instructorControllerGetWorkspace**](#instructorcontrollergetworkspace) | **GET** /api/instructors/onboarding | Get instructor onboarding workspace|
|[**instructorControllerRemoveMedia**](#instructorcontrollerremovemedia) | **DELETE** /api/instructors/offerings/{offeringId}/media/{mediaId} | Remove offering media|
|[**instructorControllerRemoveOffering**](#instructorcontrollerremoveoffering) | **DELETE** /api/instructors/offerings/{offeringId} | Remove an instructor offering|
|[**instructorControllerSaveProfile**](#instructorcontrollersaveprofile) | **PATCH** /api/instructors/profile | Create or update instructor profile|
|[**instructorControllerSubmitApplication**](#instructorcontrollersubmitapplication) | **POST** /api/instructors/submit | Submit instructor application|
|[**instructorControllerUpdateOffering**](#instructorcontrollerupdateoffering) | **PATCH** /api/instructors/offerings/{offeringId} | Update an instructor offering|

# **instructorControllerAddOffering**
> InstructorOfferingResponseDto instructorControllerAddOffering(createOfferingDto)


### Example

```typescript
import {
    InstructorApi,
    Configuration,
    CreateOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration,
    ConfirmOfferingMediaUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration,
    RequestOfferingMediaUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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

# **instructorControllerGetInstructors**
> PublicInstructorListResponseDto instructorControllerGetInstructors()


### Example

```typescript
import {
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let search: string; // (optional) (default to undefined)
let subcategoryId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.instructorControllerGetInstructors(
    page,
    limit,
    search,
    subcategoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **subcategoryId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PublicInstructorListResponseDto**

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

# **instructorControllerGetMediaViewUrl**
> PresignedDownloadResponseDto instructorControllerGetMediaViewUrl()


### Example

```typescript
import {
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration,
    UpdateInstructorProfileDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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
    InstructorApi,
    Configuration,
    UpdateOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InstructorApi(configuration);

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

