# ChatRoomDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**bookingId** | **string** |  | [default to undefined]
**lastMessageAt** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**canWrite** | **boolean** | Indicates if current user can post new messages based on booking status and grace window | [default to undefined]
**readOnlyReason** | **string** | Reason why chat is read-only if canWrite is false | [optional] [default to undefined]
**bookingStatus** | **string** |  | [default to undefined]
**slotStartTime** | **string** |  | [default to undefined]
**slotEndTime** | **string** |  | [default to undefined]
**student** | [**ChatParticipantDto**](ChatParticipantDto.md) |  | [default to undefined]
**instructor** | [**ChatParticipantDto**](ChatParticipantDto.md) |  | [default to undefined]
**lastMessage** | [**ChatMessageDto**](ChatMessageDto.md) |  | [optional] [default to undefined]
**unreadCount** | **number** |  | [default to 0]

## Example

```typescript
import { ChatRoomDto } from './api';

const instance: ChatRoomDto = {
    id,
    bookingId,
    lastMessageAt,
    createdAt,
    updatedAt,
    canWrite,
    readOnlyReason,
    bookingStatus,
    slotStartTime,
    slotEndTime,
    student,
    instructor,
    lastMessage,
    unreadCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
