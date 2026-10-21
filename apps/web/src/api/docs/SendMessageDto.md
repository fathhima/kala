# SendMessageDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **string** | The text content of the message | [default to undefined]
**type** | **string** |  | [optional] [default to TypeEnum_Text]
**tempId** | **string** | Optional client generated tempId for optimistic delivery matching | [optional] [default to undefined]

## Example

```typescript
import { SendMessageDto } from './api';

const instance: SendMessageDto = {
    content,
    type,
    tempId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
