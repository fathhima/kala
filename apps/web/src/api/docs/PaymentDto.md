# PaymentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**bookingId** | **string** |  | [default to undefined]
**studentId** | **string** |  | [default to undefined]
**amount** | **number** |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**gateway** | **string** |  | [default to undefined]
**gatewayId** | **object** |  | [optional] [default to undefined]
**refundId** | **object** |  | [optional] [default to undefined]
**refundAmount** | **object** |  | [optional] [default to undefined]
**failureReason** | **object** |  | [optional] [default to undefined]
**paidAt** | **object** |  | [optional] [default to undefined]
**refundedAt** | **object** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { PaymentDto } from './api';

const instance: PaymentDto = {
    id,
    bookingId,
    studentId,
    amount,
    currency,
    status,
    gateway,
    gatewayId,
    refundId,
    refundAmount,
    failureReason,
    paidAt,
    refundedAt,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
