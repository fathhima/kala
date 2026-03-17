# LoginDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** | The email address of the user trying to log in | [default to undefined]
**password** | **string** | The password of the user trying to log in. Must be at least 8 characters long. | [default to undefined]

## Example

```typescript
import { LoginDto } from './api';

const instance: LoginDto = {
    email,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
