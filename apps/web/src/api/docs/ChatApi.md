# ChatApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**chatControllerGetMessages**](#chatcontrollergetmessages) | **GET** /api/chat/rooms/{bookingId}/messages | Get paginated message history for a booking session|
|[**chatControllerGetRoom**](#chatcontrollergetroom) | **GET** /api/chat/rooms/{bookingId} | Get or initialize a chat room for a booking|
|[**chatControllerMarkRead**](#chatcontrollermarkread) | **POST** /api/chat/rooms/{bookingId}/read | Mark all unread messages in the room as read|
|[**chatControllerSendMessage**](#chatcontrollersendmessage) | **POST** /api/chat/rooms/{bookingId}/messages | Send a message (REST fallback)|

# **chatControllerGetMessages**
> PaginatedChatMessagesResponseDto chatControllerGetMessages()


### Example

```typescript
import {
    ChatApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let bookingId: string; // (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.chatControllerGetMessages(
    bookingId,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**PaginatedChatMessagesResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **chatControllerGetRoom**
> ChatRoomResponseDto chatControllerGetRoom()


### Example

```typescript
import {
    ChatApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.chatControllerGetRoom(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**ChatRoomResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **chatControllerMarkRead**
> chatControllerMarkRead()


### Example

```typescript
import {
    ChatApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let bookingId: string; // (default to undefined)

const { status, data } = await apiInstance.chatControllerMarkRead(
    bookingId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Number of messages marked as read |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **chatControllerSendMessage**
> ChatMessageResponseDto chatControllerSendMessage(sendMessageDto)


### Example

```typescript
import {
    ChatApi,
    Configuration,
    SendMessageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let bookingId: string; // (default to undefined)
let sendMessageDto: SendMessageDto; //

const { status, data } = await apiInstance.chatControllerSendMessage(
    bookingId,
    sendMessageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendMessageDto** | **SendMessageDto**|  | |
| **bookingId** | [**string**] |  | defaults to undefined|


### Return type

**ChatMessageResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

