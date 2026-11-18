# ReviewsApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**reviewControllerCreate**](#reviewcontrollercreate) | **POST** /api/reviews | Submit a review for a completed booking|
|[**reviewControllerGetByBookingId**](#reviewcontrollergetbybookingid) | **GET** /api/reviews/booking/{bookingId} | Get review for a specific booking|
|[**reviewControllerGetInstructorReviews**](#reviewcontrollergetinstructorreviews) | **GET** /api/reviews/instructor/{profileId} | Get reviews for an instructor profile|
|[**reviewControllerGetInstructorSummary**](#reviewcontrollergetinstructorsummary) | **GET** /api/reviews/instructor/{profileId}/summary | Get review summary (average &amp; distribution) for an instructor|
|[**reviewControllerGetMyReviews**](#reviewcontrollergetmyreviews) | **GET** /api/reviews/my-reviews | Get reviews for the logged-in instructor|

# **reviewControllerCreate**
> ReviewResponseDto reviewControllerCreate(createReviewDto)


### Example

```typescript
import {
    ReviewsApi,
    Configuration,
    CreateReviewDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let createReviewDto: CreateReviewDto; //

const { status, data } = await apiInstance.reviewControllerCreate(
    createReviewDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createReviewDto** | **CreateReviewDto**|  | |


### Return type

**ReviewResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reviewControllerGetByBookingId**
> ReviewResponseDto reviewControllerGetByBookingId()


### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.reviewControllerGetByBookingId(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**ReviewResponseDto**

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

# **reviewControllerGetInstructorReviews**
> PaginatedReviewsResponseDto reviewControllerGetInstructorReviews()


### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let profileId: string; // (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)
let rating: number; //Filter by specific star rating (1-5) (optional) (default to undefined)

const { status, data } = await apiInstance.reviewControllerGetInstructorReviews(
    profileId,
    page,
    limit,
    rating
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileId** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 20|
| **rating** | [**number**] | Filter by specific star rating (1-5) | (optional) defaults to undefined|


### Return type

**PaginatedReviewsResponseDto**

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

# **reviewControllerGetInstructorSummary**
> InstructorReviewSummaryResponseDto reviewControllerGetInstructorSummary()


### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let profileId: string; // (default to undefined)

const { status, data } = await apiInstance.reviewControllerGetInstructorSummary(
    profileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileId** | [**string**] |  | defaults to undefined|


### Return type

**InstructorReviewSummaryResponseDto**

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

# **reviewControllerGetMyReviews**
> PaginatedReviewsResponseDto reviewControllerGetMyReviews()


### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 20)
let rating: number; //Filter by specific star rating (1-5) (optional) (default to undefined)

const { status, data } = await apiInstance.reviewControllerGetMyReviews(
    page,
    limit,
    rating
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 20|
| **rating** | [**number**] | Filter by specific star rating (1-5) | (optional) defaults to undefined|


### Return type

**PaginatedReviewsResponseDto**

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

