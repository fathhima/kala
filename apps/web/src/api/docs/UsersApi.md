# UsersApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userControllerFindSelectable**](#usercontrollerfindselectable) | **GET** /api/users/categories | Get selectable categories and subcategories|
|[**userControllerUpdateMe**](#usercontrollerupdateme) | **PATCH** /api/users/me | Update the current user profile|

# **userControllerFindSelectable**
> CategoryListResponseDto userControllerFindSelectable()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.userControllerFindSelectable();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**CategoryListResponseDto**

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

# **userControllerUpdateMe**
> object userControllerUpdateMe(updateUserProfileDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UpdateUserProfileDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let updateUserProfileDto: UpdateUserProfileDto; //

const { status, data } = await apiInstance.userControllerUpdateMe(
    updateUserProfileDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserProfileDto** | **UpdateUserProfileDto**|  | |


### Return type

**object**

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

