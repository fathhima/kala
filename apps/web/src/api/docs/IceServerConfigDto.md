# IceServerConfigDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**urls** | **object** | STUN or TURN URLs | [default to undefined]
**username** | **string** | Username for TURN authentication (if applicable) | [optional] [default to undefined]
**credential** | **string** | Credential/Password for TURN authentication (if applicable) | [optional] [default to undefined]

## Example

```typescript
import { IceServerConfigDto } from './api';

const instance: IceServerConfigDto = {
    urls,
    username,
    credential,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
