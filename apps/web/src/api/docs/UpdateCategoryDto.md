# UpdateCategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Updated name of the category. | [optional] [default to undefined]
**slug** | **string** | Updated URL-safe identifier for the category. | [optional] [default to undefined]
**description** | **object** | Updated description of the category. Can be set to null to remove the description. | [optional] [default to undefined]
**isActive** | **boolean** | Whether the category is active and available for use. | [optional] [default to undefined]
**sortOrder** | **number** | Updated display order of the category. Lower values appear before higher values. | [optional] [default to undefined]

## Example

```typescript
import { UpdateCategoryDto } from './api';

const instance: UpdateCategoryDto = {
    name,
    slug,
    description,
    isActive,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
