# CreateSubcategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Name of the subcategory. | [default to undefined]
**slug** | **string** | Optional URL-safe identifier for the subcategory. Generated from the name when omitted. | [optional] [default to undefined]
**description** | **string** | Optional description of the subcategory. | [optional] [default to undefined]
**sortOrder** | **number** | Optional display order of the subcategory. Lower values appear before higher values. | [optional] [default to undefined]

## Example

```typescript
import { CreateSubcategoryDto } from './api';

const instance: CreateSubcategoryDto = {
    name,
    slug,
    description,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
