# AdminAnalyticsDataDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**range** | **string** |  | [default to undefined]
**users** | [**AdminUserMetricsDto**](AdminUserMetricsDto.md) |  | [default to undefined]
**applications** | [**AdminApplicationMetricsDto**](AdminApplicationMetricsDto.md) |  | [default to undefined]
**bookings** | [**AdminBookingMetricsDto**](AdminBookingMetricsDto.md) |  | [default to undefined]
**revenue** | [**AdminRevenueMetricsDto**](AdminRevenueMetricsDto.md) |  | [default to undefined]
**catalog** | [**AdminCatalogMetricsDto**](AdminCatalogMetricsDto.md) |  | [default to undefined]
**dailySeries** | [**Array&lt;AdminDailyPointDto&gt;**](AdminDailyPointDto.md) |  | [default to undefined]
**bookingStatusBreakdown** | [**Array&lt;AdminStatusBreakdownDto&gt;**](AdminStatusBreakdownDto.md) |  | [default to undefined]
**paymentStatusBreakdown** | [**Array&lt;AdminStatusBreakdownDto&gt;**](AdminStatusBreakdownDto.md) |  | [default to undefined]
**topCategories** | [**Array&lt;AdminCategoryPerformanceDto&gt;**](AdminCategoryPerformanceDto.md) |  | [default to undefined]
**topInstructors** | [**Array&lt;AdminTopInstructorDto&gt;**](AdminTopInstructorDto.md) |  | [default to undefined]
**pendingApplications** | [**Array&lt;AdminPendingApplicationItemDto&gt;**](AdminPendingApplicationItemDto.md) |  | [default to undefined]
**recentBookings** | [**Array&lt;AdminRecentBookingItemDto&gt;**](AdminRecentBookingItemDto.md) |  | [default to undefined]

## Example

```typescript
import { AdminAnalyticsDataDto } from './api';

const instance: AdminAnalyticsDataDto = {
    range,
    users,
    applications,
    bookings,
    revenue,
    catalog,
    dailySeries,
    bookingStatusBreakdown,
    paymentStatusBreakdown,
    topCategories,
    topInstructors,
    pendingApplications,
    recentBookings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
