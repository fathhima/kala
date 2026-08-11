# AdminCategoriesApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**categoryControllerConfirmCategoryImageUpload**](#categorycontrollerconfirmcategoryimageupload) | **POST** /api/admin/categories/{categoryId}/image/confirm | Confirm and attach an uploaded category image|
|[**categoryControllerConfirmSubcategoryImageUpload**](#categorycontrollerconfirmsubcategoryimageupload) | **POST** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/confirm | Confirm and attach an uploaded subcategory image|
|[**categoryControllerCreateCategory**](#categorycontrollercreatecategory) | **POST** /api/admin/categories | Create a category|
|[**categoryControllerCreateCategoryImageUploadUrl**](#categorycontrollercreatecategoryimageuploadurl) | **POST** /api/admin/categories/{categoryId}/image/upload-url | Create a temporary S3 upload URL for a category image|
|[**categoryControllerCreateSubcategory**](#categorycontrollercreatesubcategory) | **POST** /api/admin/categories/{categoryId}/subcategories | Create a subcategory within a category|
|[**categoryControllerCreateSubcategoryImageUploadUrl**](#categorycontrollercreatesubcategoryimageuploadurl) | **POST** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/upload-url | Create a temporary S3 upload URL for a subcategory image|
|[**categoryControllerFindAll**](#categorycontrollerfindall) | **GET** /api/admin/categories | Get all categories and subcategories for admin management|
|[**categoryControllerFindSubcategories**](#categorycontrollerfindsubcategories) | **GET** /api/admin/categories/{categoryId}/subcategories | Get subcategories in a category|
|[**categoryControllerGetCategoryImageViewUrl**](#categorycontrollergetcategoryimageviewurl) | **GET** /api/admin/categories/{categoryId}/image/view-url | Create a temporary private S3 view URL for a category image|
|[**categoryControllerGetSubcategoryImageViewUrl**](#categorycontrollergetsubcategoryimageviewurl) | **GET** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image/view-url | Create a temporary private S3 view URL for a subcategory image|
|[**categoryControllerRemoveCategoryImage**](#categorycontrollerremovecategoryimage) | **DELETE** /api/admin/categories/{categoryId}/image | Remove the image from a category and S3|
|[**categoryControllerRemoveSubcategoryImage**](#categorycontrollerremovesubcategoryimage) | **DELETE** /api/admin/categories/{categoryId}/subcategories/{subcategoryId}/image | Remove a subcategory image from the record and S3|
|[**categoryControllerUpdateCategory**](#categorycontrollerupdatecategory) | **PATCH** /api/admin/categories/{categoryId} | Update or archive a category|
|[**categoryControllerUpdateSubcategory**](#categorycontrollerupdatesubcategory) | **PATCH** /api/admin/categories/{categoryId}/subcategories/{subcategoryId} | Update or archive a subcategory|

# **categoryControllerConfirmCategoryImageUpload**
> CategoryResponseDto categoryControllerConfirmCategoryImageUpload(confirmCategoryImageUploadDto)


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

const { status, data } = await apiInstance.categoryControllerConfirmCategoryImageUpload(
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

# **categoryControllerConfirmSubcategoryImageUpload**
> SubcategoryResponseDto categoryControllerConfirmSubcategoryImageUpload(confirmCategoryImageUploadDto)


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

const { status, data } = await apiInstance.categoryControllerConfirmSubcategoryImageUpload(
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

# **categoryControllerCreateCategory**
> CategoryResponseDto categoryControllerCreateCategory(createCategoryDto)


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

const { status, data } = await apiInstance.categoryControllerCreateCategory(
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

# **categoryControllerCreateCategoryImageUploadUrl**
> CategoryImageUploadResponseDto categoryControllerCreateCategoryImageUploadUrl(requestCategoryImageUploadDto)


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

const { status, data } = await apiInstance.categoryControllerCreateCategoryImageUploadUrl(
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

# **categoryControllerCreateSubcategory**
> SubcategoryResponseDto categoryControllerCreateSubcategory(createSubcategoryDto)


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

const { status, data } = await apiInstance.categoryControllerCreateSubcategory(
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

# **categoryControllerCreateSubcategoryImageUploadUrl**
> SubcategoryImageUploadResponseDto categoryControllerCreateSubcategoryImageUploadUrl(requestCategoryImageUploadDto)


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

const { status, data } = await apiInstance.categoryControllerCreateSubcategoryImageUploadUrl(
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

# **categoryControllerFindAll**
> CategoryListResponseDto categoryControllerFindAll()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

const { status, data } = await apiInstance.categoryControllerFindAll();
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
|**401** | Access token is missing or invalid |  -  |
|**403** | Only admins can access this resource |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerFindSubcategories**
> SubcategoryListResponseDto categoryControllerFindSubcategories()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.categoryControllerFindSubcategories(
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

# **categoryControllerGetCategoryImageViewUrl**
> CategoryImageViewResponseDto categoryControllerGetCategoryImageViewUrl()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.categoryControllerGetCategoryImageViewUrl(
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

# **categoryControllerGetSubcategoryImageViewUrl**
> SubcategoryImageViewResponseDto categoryControllerGetSubcategoryImageViewUrl()


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

const { status, data } = await apiInstance.categoryControllerGetSubcategoryImageViewUrl(
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

# **categoryControllerRemoveCategoryImage**
> CategoryResponseDto categoryControllerRemoveCategoryImage()


### Example

```typescript
import {
    AdminCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCategoriesApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.categoryControllerRemoveCategoryImage(
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

# **categoryControllerRemoveSubcategoryImage**
> SubcategoryResponseDto categoryControllerRemoveSubcategoryImage()


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

const { status, data } = await apiInstance.categoryControllerRemoveSubcategoryImage(
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

# **categoryControllerUpdateCategory**
> CategoryResponseDto categoryControllerUpdateCategory(updateCategoryDto)


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

const { status, data } = await apiInstance.categoryControllerUpdateCategory(
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

# **categoryControllerUpdateSubcategory**
> SubcategoryResponseDto categoryControllerUpdateSubcategory(updateSubcategoryDto)


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

const { status, data } = await apiInstance.categoryControllerUpdateSubcategory(
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

