# ResetPasswordDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **string** | The token send with the email | [default to undefined]
**newPassword** | **string** | The password of the user. Must be at least 8 characters long. | [default to undefined]

## Example

```typescript
import { ResetPasswordDto } from './api';

const instance: ResetPasswordDto = {
    token,
    newPassword,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
