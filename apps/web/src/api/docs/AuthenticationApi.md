# AuthenticationApi

All URIs are relative to *http://localhost:4000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerForgotPassword**](#authcontrollerforgotpassword) | **POST** /api/auth/forgot-password | Send password reset link to email|
|[**authControllerGoogleSignin**](#authcontrollergooglesignin) | **POST** /api/auth/google-signin | Sign in with Google|
|[**authControllerLogin**](#authcontrollerlogin) | **POST** /api/auth/login | Login with email and password|
|[**authControllerLogout**](#authcontrollerlogout) | **POST** /api/auth/logout | logout current session|
|[**authControllerLogoutAll**](#authcontrollerlogoutall) | **POST** /api/auth/logout-all | Logout all sessions of current user|
|[**authControllerMe**](#authcontrollerme) | **GET** /api/auth/me | Get current authenticated user|
|[**authControllerRefresh**](#authcontrollerrefresh) | **POST** /api/auth/refresh | Refresh access token using refresh cookie|
|[**authControllerRegister**](#authcontrollerregister) | **POST** /api/auth/register | Register user and send OTP to email|
|[**authControllerResendOtp**](#authcontrollerresendotp) | **POST** /api/auth/resend-otp | Resend OTP to email|
|[**authControllerResetPassword**](#authcontrollerresetpassword) | **POST** /api/auth/reset-password | Reset password using reset token|
|[**authControllerValidateResetToken**](#authcontrollervalidateresettoken) | **POST** /api/auth/reset-password/validate | Validate password reset token|
|[**authControllerVerifyOtp**](#authcontrollerverifyotp) | **POST** /api/auth/verify-otp | Verify OTP and create account|

# **authControllerForgotPassword**
> MessageResponseDto authControllerForgotPassword(forgotPasswordDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ForgotPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let forgotPasswordDto: ForgotPasswordDto; //

const { status, data } = await apiInstance.authControllerForgotPassword(
    forgotPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **forgotPasswordDto** | **ForgotPasswordDto**|  | |


### Return type

**MessageResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerGoogleSignin**
> AuthResponseDto authControllerGoogleSignin(googleSignInRequestDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    GoogleSignInRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let googleSignInRequestDto: GoogleSignInRequestDto; //

const { status, data } = await apiInstance.authControllerGoogleSignin(
    googleSignInRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **googleSignInRequestDto** | **GoogleSignInRequestDto**|  | |


### Return type

**AuthResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**401** | Invalid Google token |  -  |
|**403** | Account is blocked |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogin**
> AuthResponseDto authControllerLogin(loginDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    LoginDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let loginDto: LoginDto; //

const { status, data } = await apiInstance.authControllerLogin(
    loginDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginDto** | **LoginDto**|  | |


### Return type

**AuthResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**401** | Invalid credentials |  -  |
|**403** | Account not verified or blocked |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> authControllerLogout()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.authControllerLogout();
```

### Parameters
This endpoint does not have any parameters.


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogoutAll**
> authControllerLogoutAll()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.authControllerLogoutAll();
```

### Parameters
This endpoint does not have any parameters.


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerMe**
> MeResponseDto authControllerMe()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.authControllerMe();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MeResponseDto**

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

# **authControllerRefresh**
> authControllerRefresh()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.authControllerRefresh();
```

### Parameters
This endpoint does not have any parameters.


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRegister**
> RegisterResponseDto authControllerRegister(registerDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    RegisterDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let registerDto: RegisterDto; //

const { status, data } = await apiInstance.authControllerRegister(
    registerDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerDto** | **RegisterDto**|  | |


### Return type

**RegisterResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**400** | Invalid data or email already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerResendOtp**
> ResendOtpResponseDto authControllerResendOtp(resendOtpDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ResendOtpDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let resendOtpDto: ResendOtpDto; //

const { status, data } = await apiInstance.authControllerResendOtp(
    resendOtpDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resendOtpDto** | **ResendOtpDto**|  | |


### Return type

**ResendOtpResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**400** | Registration not found or already verified |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerResetPassword**
> MessageResponseDto authControllerResetPassword(resetPasswordDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ResetPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let resetPasswordDto: ResetPasswordDto; //

const { status, data } = await apiInstance.authControllerResetPassword(
    resetPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetPasswordDto** | **ResetPasswordDto**|  | |


### Return type

**MessageResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerValidateResetToken**
> authControllerValidateResetToken(validateResetTokenDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ValidateResetTokenDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let validateResetTokenDto: ValidateResetTokenDto; //

const { status, data } = await apiInstance.authControllerValidateResetToken(
    validateResetTokenDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **validateResetTokenDto** | **ValidateResetTokenDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerVerifyOtp**
> AuthResponseDto authControllerVerifyOtp(verifyOtpDto)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    VerifyOtpDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let verifyOtpDto: VerifyOtpDto; //

const { status, data } = await apiInstance.authControllerVerifyOtp(
    verifyOtpDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyOtpDto** | **VerifyOtpDto**|  | |


### Return type

**AuthResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**400** | Invalid OTP or expired registration |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

