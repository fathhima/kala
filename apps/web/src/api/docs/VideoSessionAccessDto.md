# VideoSessionAccessDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bookingId** | **string** |  | [default to undefined]
**canJoin** | **boolean** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**reason** | **string** |  | [optional] [default to undefined]
**sessionTitle** | **string** |  | [default to undefined]
**slotStartTime** | **string** |  | [default to undefined]
**slotEndTime** | **string** |  | [default to undefined]
**earlyJoinTime** | **string** |  | [default to undefined]
**overtimeEndTime** | **string** |  | [default to undefined]
**isOvertime** | **boolean** |  | [default to undefined]
**currentUserRole** | **string** |  | [default to undefined]
**partner** | [**VideoPartnerDto**](VideoPartnerDto.md) |  | [default to undefined]
**iceServers** | [**Array&lt;IceServerConfigDto&gt;**](IceServerConfigDto.md) |  | [default to undefined]

## Example

```typescript
import { VideoSessionAccessDto } from './api';

const instance: VideoSessionAccessDto = {
    bookingId,
    canJoin,
    status,
    reason,
    sessionTitle,
    slotStartTime,
    slotEndTime,
    earlyJoinTime,
    overtimeEndTime,
    isOvertime,
    currentUserRole,
    partner,
    iceServers,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
