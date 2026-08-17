# AdminInstructorManagementApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminInstructorControllerFindAll**](#admininstructorcontrollerfindall) | **GET** /api/admin/instructor-applications | List instructor applications for admin review|
|[**adminInstructorControllerFindOne**](#admininstructorcontrollerfindone) | **GET** /api/admin/instructor-applications/{applicationId} | Get an instructor application for review|
|[**adminInstructorControllerReviewOffering**](#admininstructorcontrollerreviewoffering) | **PATCH** /api/admin/instructor-applications/{applicationId}/offerings/{offeringId}/review | Approve, reject, or request changes for an offering|

# **adminInstructorControllerFindAll**
> PaginatedInstructorApplicationsResponseDto adminInstructorControllerFindAll()


### Example

```typescript
import {
    AdminInstructorManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminInstructorManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'CANCELLED'; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.adminInstructorControllerFindAll(
    page,
    limit,
    status,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **status** | [**&#39;PENDING&#39; | &#39;APPROVED&#39; | &#39;REJECTED&#39; | &#39;CHANGES_REQUESTED&#39; | &#39;CANCELLED&#39;**]**Array<&#39;PENDING&#39; &#124; &#39;APPROVED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;CHANGES_REQUESTED&#39; &#124; &#39;CANCELLED&#39;>** |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PaginatedInstructorApplicationsResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**401** | Access token is missing or invalid |  -  |
|**403** | Only admins can access instructor applications |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminInstructorControllerFindOne**
> InstructorApplicationResponseDto adminInstructorControllerFindOne()


### Example

```typescript
import {
    AdminInstructorManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminInstructorManagementApi(configuration);

let applicationId: string; // (default to undefined)

const { status, data } = await apiInstance.adminInstructorControllerFindOne(
    applicationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **applicationId** | [**string**] |  | defaults to undefined|


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
|**404** | Instructor application not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminInstructorControllerReviewOffering**
> InstructorApplicationResponseDto adminInstructorControllerReviewOffering(reviewOfferingDto)


### Example

```typescript
import {
    AdminInstructorManagementApi,
    Configuration,
    ReviewOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminInstructorManagementApi(configuration);

let applicationId: string; // (default to undefined)
let offeringId: string; // (default to undefined)
let reviewOfferingDto: ReviewOfferingDto; //

const { status, data } = await apiInstance.adminInstructorControllerReviewOffering(
    applicationId,
    offeringId,
    reviewOfferingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewOfferingDto** | **ReviewOfferingDto**|  | |
| **applicationId** | [**string**] |  | defaults to undefined|
| **offeringId** | [**string**] |  | defaults to undefined|


### Return type

**InstructorApplicationResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Application or offering not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

