# ChangePasswordDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**currentPassword** | **string** | Required only when the account already has a password. | [optional] [default to undefined]
**newPassword** | **string** |  | [default to undefined]

## Example

```typescript
import { ChangePasswordDto } from './api';

const instance: ChangePasswordDto = {
    currentPassword,
    newPassword,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
