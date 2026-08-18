# CategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**imageUrl** | **string** |  | [optional] [default to undefined]
**imageStorageKey** | **string** |  | [optional] [default to undefined]
**isActive** | **boolean** |  | [default to undefined]
**sortOrder** | **number** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**subcategories** | [**Array&lt;SubcategoryDto&gt;**](SubcategoryDto.md) |  | [default to undefined]

## Example

```typescript
import { CategoryDto } from './api';

const instance: CategoryDto = {
    id,
    name,
    slug,
    description,
    imageUrl,
    imageStorageKey,
    isActive,
    sortOrder,
    createdAt,
    updatedAt,
    subcategories,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
