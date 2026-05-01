# AuthResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **boolean** | Indicates whether the authentication was successful | [default to undefined]
**message** | **string** | A message describing the result of the authentication attempt | [default to undefined]
**data** | [**AuthDataDto**](AuthDataDto.md) | The authentication data | [default to undefined]

## Example

```typescript
import { AuthResponseDto } from './api';

const instance: AuthResponseDto = {
    success,
    message,
    data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
