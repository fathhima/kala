# PublicOfferingDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**hourlyRate** | **string** |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**experienceYears** | **number** |  | [optional] [default to undefined]
**subcategory** | [**PublicOfferingSubcategoryDto**](PublicOfferingSubcategoryDto.md) |  | [default to undefined]
**media** | [**Array&lt;PublicMediaDto&gt;**](PublicMediaDto.md) |  | [default to undefined]

## Example

```typescript
import { PublicOfferingDto } from './api';

const instance: PublicOfferingDto = {
    id,
    title,
    description,
    hourlyRate,
    currency,
    experienceYears,
    subcategory,
    media,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
