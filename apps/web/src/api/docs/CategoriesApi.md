# CategoriesApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**categoryControllerFindSelectable**](#categorycontrollerfindselectable) | **GET** /api/categories/selectable | Get selectable categories and subcategories|

# **categoryControllerFindSelectable**
> CategoryListResponseDto categoryControllerFindSelectable()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

const { status, data } = await apiInstance.categoryControllerFindSelectable();
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

