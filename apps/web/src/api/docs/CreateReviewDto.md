# CreateReviewDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bookingId** | **string** | Booking ID being reviewed | [default to undefined]
**rating** | **number** | Rating from 1 to 5 | [default to undefined]
**comment** | **string** | Optional feedback note | [optional] [default to undefined]

## Example

```typescript
import { CreateReviewDto } from './api';

const instance: CreateReviewDto = {
    bookingId,
    rating,
    comment,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
