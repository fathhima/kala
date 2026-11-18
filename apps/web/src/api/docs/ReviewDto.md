# ReviewDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**bookingId** | **string** |  | [default to undefined]
**studentId** | **string** |  | [default to undefined]
**profileId** | **string** |  | [default to undefined]
**rating** | **number** |  | [default to undefined]
**comment** | **object** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**student** | [**ReviewStudentDto**](ReviewStudentDto.md) |  | [default to undefined]

## Example

```typescript
import { ReviewDto } from './api';

const instance: ReviewDto = {
    id,
    bookingId,
    studentId,
    profileId,
    rating,
    comment,
    createdAt,
    updatedAt,
    student,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
