# AuthDataDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accessToken** | **string** | The access token for the user | [default to undefined]
**refreshToken** | **string** | The refresh token for the user | [default to undefined]
**user** | [**SafeUserDto**](SafeUserDto.md) | The user information | [default to undefined]

## Example

```typescript
import { AuthDataDto } from './api';

const instance: AuthDataDto = {
    accessToken,
    refreshToken,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
