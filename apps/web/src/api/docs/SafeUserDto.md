# SafeUserDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | The unique identifier of the user | [default to undefined]
**name** | **string** | The name of the user | [default to undefined]
**email** | **string** | The email address of the user | [default to undefined]
**roles** | [**Array&lt;Role&gt;**](Role.md) | The roles assigned to the user | [default to undefined]
**imageUrl** | **object** | The URL of the user\&#39;s profile image | [default to undefined]
**isVerified** | **boolean** | Indicates whether the user has verified their email address | [default to undefined]
**isActive** | **boolean** | Indicates whether the user is active | [default to undefined]

## Example

```typescript
import { SafeUserDto } from './api';

const instance: SafeUserDto = {
    id,
    name,
    email,
    roles,
    imageUrl,
    isVerified,
    isActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
