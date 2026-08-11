# UpdateSubcategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Updated name of the subcategory. | [optional] [default to undefined]
**slug** | **string** | Updated URL-safe identifier for the subcategory. | [optional] [default to undefined]
**description** | **object** | Updated description of the subcategory. Can be set to null to remove the description. | [optional] [default to undefined]
**isActive** | **boolean** | Whether the subcategory is active and available for use. | [optional] [default to undefined]
**sortOrder** | **number** | Updated display order of the subcategory. Lower values appear before higher values. | [optional] [default to undefined]

## Example

```typescript
import { UpdateSubcategoryDto } from './api';

const instance: UpdateSubcategoryDto = {
    name,
    slug,
    description,
    isActive,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
