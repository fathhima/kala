# CreateCategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Name of the category. | [default to undefined]
**slug** | **string** | Optional URL-safe identifier for the category. Generated from the name when omitted. | [optional] [default to undefined]
**description** | **string** | Optional description of the category. | [optional] [default to undefined]
**sortOrder** | **number** | Optional display order of the category. Lower values appear before higher values. | [optional] [default to undefined]

## Example

```typescript
import { CreateCategoryDto } from './api';

const instance: CreateCategoryDto = {
    name,
    slug,
    description,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
