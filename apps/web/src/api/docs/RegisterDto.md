# RegisterDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | The full name of the user | [default to undefined]
**email** | **string** | The email address of the user | [default to undefined]
**password** | **string** | The password of the user. Must be at least 8 characters long. | [default to undefined]

## Example

```typescript
import { RegisterDto } from './api';

const instance: RegisterDto = {
    name,
    email,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
