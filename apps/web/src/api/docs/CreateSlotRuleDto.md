# CreateSlotRuleDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**offeringId** | **string** |  | [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**weekday** | **number** | 0 &#x3D; Sunday, 1 &#x3D; Monday | [default to undefined]
**startMinute** | **number** |  | [default to undefined]
**endMinute** | **number** |  | [default to undefined]
**slotDurationMinutes** | **number** |  | [default to undefined]
**timezone** | **string** |  | [optional] [default to 'Asia/Kolkata']
**effectiveFrom** | **string** |  | [default to undefined]
**effectiveUntil** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateSlotRuleDto } from './api';

const instance: CreateSlotRuleDto = {
    offeringId,
    title,
    weekday,
    startMinute,
    endMinute,
    slotDurationMinutes,
    timezone,
    effectiveFrom,
    effectiveUntil,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
