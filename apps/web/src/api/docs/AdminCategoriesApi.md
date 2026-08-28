# AdminCategoriesApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminCategoryControllerConfirmCategoryImageUpload**](#admincategorycontrollerconfirmcategoryimageupload) | **POST** /api/admin/categories/{categoryId}/image/confirm | Confirm and attach an uploaded category image|
|[**adminCategoryControllerConfirmSubcategoryImageUpload**](#admincategorycontrollerconfirmsubcategoryimageupload) | **POST** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/confirm | Confirm and attach an uploaded subcategory image|
|[**adminCategoryControllerCreateCategory**](#admincategorycontrollercreatecategory) | **POST** /api/admin/categories | Create a category|
|[**adminCategoryControllerCreateCategoryImageUploadUrl**](#admincategorycontrollercreatecategoryimageuploadurl) | **POST** /api/admin/categories/{categoryId}/image/upload-url | Create a temporary S3 upload URL for a category image|
|[**adminCategoryControllerCreateSubcategory**](#admincategorycontrollercreatesubcategory) | **POST** /api/admin/categories/{categoryId}/subcategories | Create a subcategory within a category|
|[**adminCategoryControllerCreateSubcategoryImageUploadUrl**](#admincategorycontrollercreatesubcategoryimageuploadurl) | **POST** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/upload-url | Create a temporary S3 upload URL for a subcategory image|
|[**adminCategoryControllerFindAll**](#admincategorycontrollerfindall) | **GET** /api/admin/categories | Get paginated categories and subcategories for admin management|
|[**adminCategoryControllerFindSubcategories**](#admincategorycontrollerfindsubcategories) | **GET** /api/admin/categories/{categoryId}/subcategories | Get subcategories in a category|
|[**adminCategoryControllerGetCategoryImageViewUrl**](#admincategorycontrollergetcategoryimageviewurl) | **GET** /api/admin/categories/{categoryId}/image/view-url | Create a temporary private S3 view URL for a category image|
|[**adminCategoryControllerGetSubcategoryImageViewUrl**](#admincategorycontrollergetsubcategoryimageviewurl) | **GET** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/view-url | Create a temporary private S3 view URL for a subcategory image|
|[**adminCategoryControllerRemoveCategoryImage**](#admincategorycontrollerremovecategoryimage) | **DELETE** /api/admin/categories/{categoryId}/image | Remove the image from a category and S3|
|[**adminCategoryControllerRemoveSubcategoryImage**](#admincategorycontrollerremovesubcategoryimage) | **DELETE** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image | Remove a subcategory image from the record and S3|
|[**adminCategoryControllerUpdateCategory**](#admincategorycontrollerupdatecategory) | **PATCH** /api/admin/categories/{categoryId} | Update or archive a category|
|[**adminCategoryControllerUpdateSubcategory**](#admincategorycontrollerupdatesubcategory) | **PATCH** /api/admin/categories/{categoryId}/subcategories/{subcategoryId} | Update or archive a subcategory|

# **adminCategoryControllerConfirmCategoryImageUpload**
> CategoryResponseDto adminCategoryControllerConfirmCategoryImageUpload(confirmCategoryImageUploadDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    ConfirmCategoryImageUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let confirmCategoryImageUploadDto: ConfirmCategoryImageUploadDto; //

const { status, data } = await apiInstance.adminCategoryControllerConfirmCategoryImageUpload(
    categoryId,
    confirmCategoryImageUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **confirmCategoryImageUploadDto** | **ConfirmCategoryImageUploadDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponseDto**

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

# **adminCategoryControllerConfirmSubcategoryImageUpload**
> SubcategoryResponseDto adminCategoryControllerConfirmSubcategoryImageUpload(confirmCategoryImageUploadDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    ConfirmCategoryImageUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let subcategoryId: string; // (default to undefined)
let confirmCategoryImageUploadDto: ConfirmCategoryImageUploadDto; //

const { status, data } = await apiInstance.adminCategoryControllerConfirmSubcategoryImageUpload(
    categoryId,
    subcategoryId,
    confirmCategoryImageUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **confirmCategoryImageUploadDto** | **ConfirmCategoryImageUploadDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|
| **subcategoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryResponseDto**

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

# **adminCategoryControllerCreateCategory**
> CategoryResponseDto adminCategoryControllerCreateCategory(createCategoryDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    CreateCategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let createCategoryDto: CreateCategoryDto; //

const { status, data } = await apiInstance.adminCategoryControllerCreateCategory(
    createCategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCategoryDto** | **CreateCategoryDto**|  | |


### Return type

**CategoryResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |
|**409** | A category with this slug already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCategoryControllerCreateCategoryImageUploadUrl**
> CategoryImageUploadResponseDto adminCategoryControllerCreateCategoryImageUploadUrl(requestCategoryImageUploadDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    RequestCategoryImageUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let requestCategoryImageUploadDto: RequestCategoryImageUploadDto; //

const { status, data } = await apiInstance.adminCategoryControllerCreateCategoryImageUploadUrl(
    categoryId,
    requestCategoryImageUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestCategoryImageUploadDto** | **RequestCategoryImageUploadDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CategoryImageUploadResponseDto**

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

# **adminCategoryControllerCreateSubcategory**
> SubcategoryResponseDto adminCategoryControllerCreateSubcategory(createSubcategoryDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    CreateSubcategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let createSubcategoryDto: CreateSubcategoryDto; //

const { status, data } = await apiInstance.adminCategoryControllerCreateSubcategory(
    categoryId,
    createSubcategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSubcategoryDto** | **CreateSubcategoryDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |
|**404** | Category not found |  -  |
|**409** | A subcategory with this slug already exists in this category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCategoryControllerCreateSubcategoryImageUploadUrl**
> SubcategoryImageUploadResponseDto adminCategoryControllerCreateSubcategoryImageUploadUrl(requestCategoryImageUploadDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    RequestCategoryImageUploadDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let subcategoryId: string; // (default to undefined)
let requestCategoryImageUploadDto: RequestCategoryImageUploadDto; //

const { status, data } = await apiInstance.adminCategoryControllerCreateSubcategoryImageUploadUrl(
    categoryId,
    subcategoryId,
    requestCategoryImageUploadDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestCategoryImageUploadDto** | **RequestCategoryImageUploadDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|
| **subcategoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryImageUploadResponseDto**

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

# **adminCategoryControllerFindAll**
> PaginatedCategoryResponseDto adminCategoryControllerFindAll()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let search: string; // (optional) (default to undefined)
let isActive: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerFindAll(
    page,
    limit,
    search,
    isActive
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **isActive** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PaginatedCategoryResponseDto**

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

# **adminCategoryControllerFindSubcategories**
> SubcategoryListResponseDto adminCategoryControllerFindSubcategories()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerFindSubcategories(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryListResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Category not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCategoryControllerGetCategoryImageViewUrl**
> CategoryImageViewResponseDto adminCategoryControllerGetCategoryImageViewUrl()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerGetCategoryImageViewUrl(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CategoryImageViewResponseDto**

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

# **adminCategoryControllerGetSubcategoryImageViewUrl**
> SubcategoryImageViewResponseDto adminCategoryControllerGetSubcategoryImageViewUrl()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let subcategoryId: string; // (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerGetSubcategoryImageViewUrl(
    categoryId,
    subcategoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|
| **subcategoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryImageViewResponseDto**

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

# **adminCategoryControllerRemoveCategoryImage**
> CategoryResponseDto adminCategoryControllerRemoveCategoryImage()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerRemoveCategoryImage(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponseDto**

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

# **adminCategoryControllerRemoveSubcategoryImage**
> SubcategoryResponseDto adminCategoryControllerRemoveSubcategoryImage()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let subcategoryId: string; // (default to undefined)

const { status, data } = await apiInstance.adminCategoryControllerRemoveSubcategoryImage(
    categoryId,
    subcategoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|
| **subcategoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryResponseDto**

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

# **adminCategoryControllerUpdateCategory**
> CategoryResponseDto adminCategoryControllerUpdateCategory(updateCategoryDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    UpdateCategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let updateCategoryDto: UpdateCategoryDto; //

const { status, data } = await apiInstance.adminCategoryControllerUpdateCategory(
    categoryId,
    updateCategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCategoryDto** | **UpdateCategoryDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Category not found |  -  |
|**409** | A category with this slug already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCategoryControllerUpdateSubcategory**
> SubcategoryResponseDto adminCategoryControllerUpdateSubcategory(updateSubcategoryDto)


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration,
    UpdateSubcategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let subcategoryId: string; // (default to undefined)
let updateSubcategoryDto: UpdateSubcategoryDto; //

const { status, data } = await apiInstance.adminCategoryControllerUpdateSubcategory(
    categoryId,
    subcategoryId,
    updateSubcategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSubcategoryDto** | **UpdateSubcategoryDto**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|
| **subcategoryId** | [**string**] |  | defaults to undefined|


### Return type

**SubcategoryResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Category or subcategory not found |  -  |
|**409** | A subcategory with this slug already exists in this category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

