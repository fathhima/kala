# AdminUserManagementApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminUserControllerFindAll**](#adminusercontrollerfindall) | **GET** /api/admin | Get instructor applications|
|[**adminUserControllerFindOne**](#adminusercontrollerfindone) | **GET** /api/admin/{applicationId} | Get instructor application by ID|
|[**adminUserControllerGetAdminUserById**](#adminusercontrollergetadminuserbyid) | **GET** /api/admin/users/{id} | Get a single user by id for admin management|
|[**adminUserControllerGetAdminUsers**](#adminusercontrollergetadminusers) | **GET** /api/admin/users | Get paginated users for admin management|
|[**adminUserControllerReviewOffering**](#adminusercontrollerreviewoffering) | **PATCH** /api/admin/{applicationId}/offerings/{offeringId}/review | Review instructor offering|
|[**adminUserControllerUpdateAdminUserStatus**](#adminusercontrollerupdateadminuserstatus) | **PATCH** /api/admin/users/{id}/status | Block or unblock a user|

# **adminUserControllerFindAll**
> PaginatedInstructorApplicationsResponseDto adminUserControllerFindAll()


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'CANCELLED'; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.adminUserControllerFindAll(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUserControllerFindOne**
> InstructorApplicationResponseDto adminUserControllerFindOne()


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let applicationId: string; // (default to undefined)

const { status, data } = await apiInstance.adminUserControllerFindOne(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUserControllerGetAdminUserById**
> AdminUserResponseDto adminUserControllerGetAdminUserById()


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminUserControllerGetAdminUserById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AdminUserResponseDto**

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
|**403** | Only admins can access this resource |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUserControllerGetAdminUsers**
> PaginatedAdminUsersResponseDto adminUserControllerGetAdminUsers()


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let search: string; //Search by name or email (optional) (default to undefined)
let role: Role; //Filter by role (optional) (default to undefined)
let status: 'active' | 'blocked'; //Filter by account status (optional) (default to undefined)

const { status, data } = await apiInstance.adminUserControllerGetAdminUsers(
    page,
    limit,
    search,
    role,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **search** | [**string**] | Search by name or email | (optional) defaults to undefined|
| **role** | **Role** | Filter by role | (optional) defaults to undefined|
| **status** | [**&#39;active&#39; | &#39;blocked&#39;**]**Array<&#39;active&#39; &#124; &#39;blocked&#39;>** | Filter by account status | (optional) defaults to undefined|


### Return type

**PaginatedAdminUsersResponseDto**

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
|**403** | Only admins can access this resource |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUserControllerReviewOffering**
> InstructorApplicationResponseDto adminUserControllerReviewOffering(reviewOfferingDto)


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration,
    ReviewOfferingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let applicationId: string; // (default to undefined)
let offeringId: string; // (default to undefined)
let reviewOfferingDto: ReviewOfferingDto; //

const { status, data } = await apiInstance.adminUserControllerReviewOffering(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUserControllerUpdateAdminUserStatus**
> AdminUserStatusResponseDto adminUserControllerUpdateAdminUserStatus(updateUserStatusDto)


### Example

```typescript
import {
    AdminUserManagementApi,
    Configuration,
    UpdateUserStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUserManagementApi(configuration);

let id: string; // (default to undefined)
let updateUserStatusDto: UpdateUserStatusDto; //

const { status, data } = await apiInstance.adminUserControllerUpdateAdminUserStatus(
    id,
    updateUserStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserStatusDto** | **UpdateUserStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AdminUserStatusResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**400** | Invalid request or admin tried to block their own account |  -  |
|**401** | Access token is missing or invalid |  -  |
|**403** | Only admins can access this resource |  -  |
|**404** | User not found |  -  |
|**409** | Admin accounts cannot be blocked |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

