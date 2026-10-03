# BookingDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slotId** | **string** |  | [default to undefined]
**studentId** | **string** |  | [default to undefined]
**offeringId** | **string** |  | [default to undefined]
**profileId** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**amount** | **number** |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**hourlyRate** | **number** |  | [default to undefined]
**durationMinutes** | **number** |  | [default to undefined]
**holdExpiresAt** | **string** |  | [default to undefined]
**cancelledAt** | **object** |  | [optional] [default to undefined]
**cancelledBy** | **object** |  | [optional] [default to undefined]
**cancelReason** | **object** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**slot** | [**BookingSlotDto**](BookingSlotDto.md) |  | [default to undefined]
**student** | [**BookingStudentDto**](BookingStudentDto.md) |  | [default to undefined]
**offering** | [**BookingOfferingDto**](BookingOfferingDto.md) |  | [default to undefined]
**instructor** | [**BookingInstructorDto**](BookingInstructorDto.md) |  | [default to undefined]

## Example

```typescript
import { BookingDto } from './api';

const instance: BookingDto = {
    id,
    slotId,
    studentId,
    offeringId,
    profileId,
    status,
    amount,
    currency,
    hourlyRate,
    durationMinutes,
    holdExpiresAt,
    cancelledAt,
    cancelledBy,
    cancelReason,
    createdAt,
    updatedAt,
    slot,
    student,
    offering,
    instructor,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
