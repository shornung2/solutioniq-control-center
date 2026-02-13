
## Secure Access Token Integration with Bearer Authentication

### Overview
You have a private access token that needs to be stored securely and used for API authentication. Your project has access to Lovable's secret management system. We'll store the token as an encrypted secret and inject it into all API requests using the standard OAuth2 `Authorization: Bearer <token>` header format.

### Current State
- API client (`src/lib/api.ts`) currently uses localStorage for API key storage and sends it via `X-API-Key` header
- The `.env.local` file has the API URLs set up correctly
- No access token is currently configured

### Implementation Plan

#### 1. **Store Access Token as a Secret**
- Use Lovable's secret management system to store your access token securely
- The token will be encrypted and never exposed in the codebase or `.env` files
- Only the backend/edge functions and API layer will have access to it

#### 2. **Update API Service** (`src/lib/api.ts`)
- Replace the `X-API-Key` header approach with `Authorization: Bearer <token>` format
- Update `getApiKey()` function to fetch the secret from the secure vault instead of localStorage
- Modify the `request()` function to use the `Authorization` header
- Update `createWebSocket()` to pass the token as a query parameter (or header if supported by your backend)
- Remove localStorage references for API key

#### 3. **Remove User-Facing API Key Configuration**
- Update `src/pages/Settings.tsx` to remove the API Key input field since it's now managed as a secure secret

### Technical Flow
```
Request Flow:
User Action
    ↓
React Component
    ↓
API Method (api.get/post/put/delete)
    ↓
request() function
    ↓
Fetch Authorization Header: Bearer <SECURE_TOKEN>
    ↓
solutioniq.cloud/api/v1/...
```

### Files to Modify
1. `src/lib/api.ts` - Update to use `Authorization: Bearer` header and remove localStorage logic
2. `src/pages/Settings.tsx` - Remove API key input field since token is now a secure secret

### Files NOT Modifying
- `.env.local` - Already has correct API URLs (VITE_API_URL, VITE_WS_URL)
- Other hooks/pages - They will automatically work with the updated API service

### Security Benefits
- Token is never stored in localStorage (which is accessible to JavaScript)
- Token is never committed to git or visible in source code
- Token is encrypted at rest in the secret vault
- Only the API layer has access to inject the token into requests

### Next Steps
1. Approve this plan
2. Provide your access token when prompted
3. Verify that API calls are working with the bearer token authentication
