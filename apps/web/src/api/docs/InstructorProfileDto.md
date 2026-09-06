# InstructorProfileDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**userId** | **string** |  | [default to undefined]
**bio** | **string** |  | [optional] [default to undefined]
**location** | **string** |  | [optional] [default to undefined]
**portfolioUrl** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**offerings** | [**Array&lt;InstructorOfferingDto&gt;**](InstructorOfferingDto.md) |  | [default to undefined]
**latestApplication** | [**InstructorApplicationDto**](InstructorApplicationDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { InstructorProfileDto } from './api';

const instance: InstructorProfileDto = {
    id,
    userId,
    bio,
    location,
    portfolioUrl,
    status,
    createdAt,
    updatedAt,
    offerings,
    latestApplication,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
