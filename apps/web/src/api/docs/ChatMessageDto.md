# ChatMessageDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**roomId** | **string** |  | [default to undefined]
**senderId** | **string** |  | [default to undefined]
**content** | **string** |  | [default to undefined]
**type** | **string** |  | [default to undefined]
**isRead** | **boolean** |  | [default to undefined]
**readAt** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**sender** | [**ChatSenderDto**](ChatSenderDto.md) |  | [default to undefined]
**tempId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ChatMessageDto } from './api';

const instance: ChatMessageDto = {
    id,
    roomId,
    senderId,
    content,
    type,
    isRead,
    readAt,
    createdAt,
    sender,
    tempId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
