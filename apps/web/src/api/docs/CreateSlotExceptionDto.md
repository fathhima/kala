# CreateSlotExceptionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**offeringId** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**startTime** | **string** |  | [default to undefined]
**endTime** | **string** |  | [default to undefined]
**timezone** | **string** |  | [optional] [default to 'Asia/Kolkata']
**slotDurationMinutes** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateSlotExceptionDto } from './api';

const instance: CreateSlotExceptionDto = {
    type,
    offeringId,
    title,
    startTime,
    endTime,
    timezone,
    slotDurationMinutes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
