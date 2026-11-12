# AdminAnalyticsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminAnalyticsControllerGetAnalytics**](#adminanalyticscontrollergetanalytics) | **GET** /api/admin/analytics | Get platform-wide admin analytics and dashboard metrics|

# **adminAnalyticsControllerGetAnalytics**
> AdminAnalyticsResponseDto adminAnalyticsControllerGetAnalytics()


### Example

```typescript
import {
    AdminAnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAnalyticsApi(configuration);

let range: '7d' | '30d' | '90d'; //Time window for trend charts and range-scoped metrics (optional) (default to '30d')

const { status, data } = await apiInstance.adminAnalyticsControllerGetAnalytics(
    range
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **range** | [**&#39;7d&#39; | &#39;30d&#39; | &#39;90d&#39;**]**Array<&#39;7d&#39; &#124; &#39;30d&#39; &#124; &#39;90d&#39;>** | Time window for trend charts and range-scoped metrics | (optional) defaults to '30d'|


### Return type

**AdminAnalyticsResponseDto**

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

