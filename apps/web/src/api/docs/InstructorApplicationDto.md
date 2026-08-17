# InstructorApplicationDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**profileId** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**submittedAt** | **string** |  | [default to undefined]
**reviewedAt** | **string** |  | [optional] [default to undefined]
**reviewedBy** | **object** |  | [optional] [default to undefined]
**reviewNote** | **object** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**offerings** | [**Array&lt;InstructorOfferingDto&gt;**](InstructorOfferingDto.md) |  | [default to undefined]
**profile** | [**InstructorApplicationProfileDto**](InstructorApplicationProfileDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { InstructorApplicationDto } from './api';

const instance: InstructorApplicationDto = {
    id,
    profileId,
    status,
    submittedAt,
    reviewedAt,
    reviewedBy,
    reviewNote,
    createdAt,
    updatedAt,
    offerings,
    profile,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
