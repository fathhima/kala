# InstructorAnalyticsDataDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**range** | **string** |  | [default to undefined]
**earnings** | [**InstructorEarningsMetricsDto**](InstructorEarningsMetricsDto.md) |  | [default to undefined]
**sessions** | [**InstructorSessionMetricsDto**](InstructorSessionMetricsDto.md) |  | [default to undefined]
**capacity** | [**InstructorCapacityMetricsDto**](InstructorCapacityMetricsDto.md) |  | [default to undefined]
**offerings** | [**InstructorOfferingStatsDto**](InstructorOfferingStatsDto.md) |  | [default to undefined]
**dailySeries** | [**Array&lt;InstructorDailyPointDto&gt;**](InstructorDailyPointDto.md) |  | [default to undefined]
**offeringPerformance** | [**Array&lt;InstructorOfferingPerformanceDto&gt;**](InstructorOfferingPerformanceDto.md) |  | [default to undefined]
**upcomingSessions** | [**Array&lt;InstructorUpcomingSessionDto&gt;**](InstructorUpcomingSessionDto.md) |  | [default to undefined]

## Example

```typescript
import { InstructorAnalyticsDataDto } from './api';

const instance: InstructorAnalyticsDataDto = {
    range,
    earnings,
    sessions,
    capacity,
    offerings,
    dailySeries,
    offeringPerformance,
    upcomingSessions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
