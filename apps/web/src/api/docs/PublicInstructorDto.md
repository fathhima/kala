# PublicInstructorDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Instructor profile ID | [default to undefined]
**name** | **string** |  | [default to undefined]
**imageUrl** | **string** |  | [optional] [default to undefined]
**bio** | **string** |  | [optional] [default to undefined]
**location** | **string** |  | [optional] [default to undefined]
**portfolioUrl** | **string** |  | [optional] [default to undefined]
**offerings** | [**Array&lt;PublicOfferingDto&gt;**](PublicOfferingDto.md) |  | [default to undefined]

## Example

```typescript
import { PublicInstructorDto } from './api';

const instance: PublicInstructorDto = {
    id,
    name,
    imageUrl,
    bio,
    location,
    portfolioUrl,
    offerings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
