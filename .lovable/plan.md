
# Update SOLUTIONIQ_ACCESS_TOKEN Secret

## Problem
The `SOLUTIONIQ_ACCESS_TOKEN` stored in the backend secrets is expired or invalid. All authenticated API calls to `solutioniq.cloud` return `401 Unauthorized` ("Invalid or expired token"), while unauthenticated endpoints like `/health/deep` work fine.

## Solution
1. Update the `SOLUTIONIQ_ACCESS_TOKEN` secret with a fresh, long-lived token
2. Redeploy the `api-proxy` edge function to pick up the new secret
3. Test the connection by calling `/agent/status` and `/chat/conversations` through the proxy

## Steps
1. Prompt you to enter the new token value securely
2. Save it as the `SOLUTIONIQ_ACCESS_TOKEN` secret
3. Verify the proxy works by testing authenticated endpoints

## Technical Details
- The `api-proxy` edge function reads `SOLUTIONIQ_ACCESS_TOKEN` via `Deno.env.get("SOLUTIONIQ_ACCESS_TOKEN")`
- The token is sent as `Authorization: Bearer <token>` to the upstream `solutioniq.cloud` API
- The token in `.env` (`VITE_AUTH_TOKEN`) has `exp: 2086459643` (valid until 2036) -- but this client-side token is NOT used by the proxy; the proxy uses the secret
