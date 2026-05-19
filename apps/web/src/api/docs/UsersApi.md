# UsersApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userControllerGetAdminUsers**](#usercontrollergetadminusers) | **GET** /api/users | Get paginated users for admin management|
|[**userControllerUpdateAdminUserStatus**](#usercontrollerupdateadminuserstatus) | **PATCH** /api/users/{id}/status | Block or unblock a user|

# **userControllerGetAdminUsers**
> PaginatedAdminUsersResponseDto userControllerGetAdminUsers()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let search: string; //Search by name or email (optional) (default to undefined)
let role: Role; //Filter by role (optional) (default to undefined)
let status: 'active' | 'blocked'; //Filter by account status (optional) (default to undefined)

const { status, data } = await apiInstance.userControllerGetAdminUsers(
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

# **userControllerUpdateAdminUserStatus**
> AdminUserStatusResponseDto userControllerUpdateAdminUserStatus(updateUserStatusDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UpdateUserStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; // (default to undefined)
let updateUserStatusDto: UpdateUserStatusDto; //

const { status, data } = await apiInstance.userControllerUpdateAdminUserStatus(
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

