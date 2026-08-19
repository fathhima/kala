# PublicCatalogApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**publicCatalogControllerGetCategories**](#publiccatalogcontrollergetcategories) | **GET** /api/public/catalog/categories | List active categories and subcategories|
|[**publicCatalogControllerGetInstructor**](#publiccatalogcontrollergetinstructor) | **GET** /api/public/catalog/instructors/{profileId} | Get one approved instructor profile|
|[**publicCatalogControllerGetInstructors**](#publiccatalogcontrollergetinstructors) | **GET** /api/public/catalog/instructors | List approved instructors and offerings|

# **publicCatalogControllerGetCategories**
> PublicCategoryListResponseDto publicCatalogControllerGetCategories()


### Example

```typescript
import {
    PublicCatalogApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCatalogApi(configuration);

const { status, data } = await apiInstance.publicCatalogControllerGetCategories();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PublicCategoryListResponseDto**

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

# **publicCatalogControllerGetInstructor**
> PublicInstructorResponseDto publicCatalogControllerGetInstructor()


### Example

```typescript
import {
    PublicCatalogApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCatalogApi(configuration);

let profileId: string; // (default to undefined)

const { status, data } = await apiInstance.publicCatalogControllerGetInstructor(
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

# **publicCatalogControllerGetInstructors**
> PublicInstructorListResponseDto publicCatalogControllerGetInstructors()


### Example

```typescript
import {
    PublicCatalogApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCatalogApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let search: string; // (optional) (default to undefined)
let subcategoryId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.publicCatalogControllerGetInstructors(
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

