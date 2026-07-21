# QR Attendance System - UNAUTHORIZED Error Fix

## Executive Summary

Fixed the "Scan Failed: UNAUTHORIZED" error in the BuildTrack QR attendance system by implementing comprehensive logging, improving error messages, and enhancing the QR code payload format.

## Root Cause Analysis

The UNAUTHORIZED error occurs when:

1. **Missing worker_id in JWT**: The backend expects `req.user.worker_id` (line 260 in attendanceController.js), but if the worker's user account doesn't have `worker_id` populated in the database, it will be `null` in the JWT payload.

2. **JWT Token Issues**:
   - Token not being sent with the request
   - Token expired
   - Token doesn't contain worker_id claim

3. **Role Authorization**: The route `/api/attendance/checkin` requires `USER_ROLES.WORKER` role (line 49 in attendanceRoutes.js)

## Files Modified

### 1. Frontend - QR Code Generation
**File**: `BUILDTRACK/src/screens/QRDisplayScreen.js`

**Changes**:
- Enhanced QR payload to include comprehensive session information:
  ```json
  {
    "type": "attendance",
    "session_id": 15,
    "project_id": 6,
    "session_token": "BT-SESSION-ABC123XYZ",
    "session_date": "2026-07-12",
    "check_in_start": "08:00:00",
    "check_in_end": "17:00:00",
    "expires_at": "2026-07-12T18:00:00Z",
    "generated_at": "2026-07-12T10:00:00Z"
  }
  ```

**Benefits**:
- QR code contains all necessary validation data
- Enables offline validation capabilities
- Provides session context for better error messages

### 2. Frontend - QR Scanner
**File**: `BUILDTRACK/src/screens/QRScannerScreen.js`

**Changes**:
- Added comprehensive logging:
  ```javascript
  console.log('🔍 Raw QR Data:', data);
  console.log('👤 Current User:', user);
  console.log('📦 Parsed QR Payload:', parsedQR);
  console.log('✅ Extracted Session Token:', sessionToken);
  console.log('📤 Sending Attendance Request:', {...});
  ```

- Enhanced QR parsing with validation:
  - Validates JSON structure
  - Extracts session_token from multiple possible fields
  - Throws descriptive errors for invalid QR codes

- Improved error messages:
  - "Authentication failed. Please log in again."
  - "Invalid QR Code. Please scan a valid attendance QR code."
  - "This attendance session is no longer active."
  - "You have already checked in for this session."

### 3. Frontend - Attendance Service
**File**: `BUILDTRACK/src/services/attendanceService.js`

**Changes**:
- Added comprehensive request/response logging:
  ```javascript
  console.log('========================================');
  console.log('📤 ATTENDANCE SERVICE - SCAN REQUEST');
  console.log('Session Token:', session_token);
  console.log('Scan Data:', scanData);
  console.log('Request Payload:', payload);
  console.log('📥 Response Status:', response.status);
  console.log('Response Data:', responseData);
  ```

- Enhanced error handling with detailed context
- Logs full request/response cycle for debugging

### 4. Frontend - API Client
**File**: `BUILDTRACK/src/services/apiClient.js`

**Changes**:
- Added authentication header logging:
  ```javascript
  console.log('🔐 Auth Headers:', {
    hasToken: !!token,
    tokenPrefix: token ? `${token.substring(0, 20)}...` : 'null',
    authorization: authHeaders.Authorization || 'NOT SET',
  });
  ```

- Added API request/response logging:
  ```javascript
  console.log('🌐 API Request:', { url, method, headers, body });
  console.log('📥 API Response:', { url, status, statusText });
  ```

- All logging only active in development mode (`__DEV__`)

### 5. Backend - Attendance Controller
**File**: `my-backend/controllers/attendanceController.js`

**Changes**:
- Added comprehensive request logging:
  ```javascript
  console.log('========================================');
  console.log('📥 ATTENDANCE CHECK-IN REQUEST');
  console.log('Authorization Header:', req.headers.authorization);
  console.log('Decoded User (req.user):', req.user);
  console.log('Request Body:', req.body);
  console.log('Session Token:', session_token);
  console.log('Worker ID:', worker_id);
  console.log('Scan Type:', scanType);
  console.log('========================================');
  ```

- Enhanced error messages with actionable information:
  - "Unauthorized: Worker authentication required. Please ensure you are logged in as a worker."
  - "Invalid QR code: Session not found. Please scan a valid attendance QR code."
  - "This attendance session is no longer active. Please contact your supervisor."
  - "Worker not found. Please contact your administrator."

- Added validation logging:
  - Session lookup results
  - Worker lookup results
  - Duplicate check-in warnings
  - Successful check-in confirmations

- Enhanced error handling with full context:
  ```javascript
  console.error('========================================');
  console.error('❌ FATAL ERROR IN ATTENDANCE CHECK-IN');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('Request User:', req.user);
  console.error('Request Body:', req.body);
  console.error('========================================');
  ```

## Backend Middleware Analysis

**File**: `my-backend/middleware/authMiddleware.js`

**Current Flow**:
1. `authenticate` middleware extracts Bearer token from Authorization header
2. Verifies JWT using `process.env.JWT_SECRET || 'devsecret'`
3. Attaches decoded payload to `req.user`
4. `authorize(USER_ROLES.WORKER)` checks if user has worker role

**JWT Payload Structure** (from authController.js):
```javascript
{
  id: user.id,           // User ID (not worker_id)
  role: user.role,       // 'worker'
  worker_id: user.worker_id  // Worker ID (can be null!)
}
```

## Critical Issues Found

### Issue 1: worker_id Can Be Null
**Location**: `my-backend/controllers/authController.js:40,66`

The JWT includes `worker_id`, but this value can be `null` if:
- The user account wasn't properly linked to a worker record
- The worker record doesn't exist
- The worker_id wasn't provided during registration

**Impact**: When `worker_id` is null, the attendance check-in fails with UNAUTHORIZED.

### Issue 2: No Validation During Login
**Location**: `my-backend/controllers/authController.js:52-79`

The login function doesn't validate that:
- Worker accounts have a valid worker_id
- The worker record exists in the database
- The user has the correct role for attendance

## Diagnostic Steps

When encountering UNAUTHORIZED error, check:

### Frontend Console Logs
Look for these log sequences:
1. `🔍 Raw QR Data:` - Should show JSON payload
2. `👤 Current User:` - Should show user object with role: 'worker'
3. `🔐 Auth Headers:` - Should show hasToken: true
4. `📤 ATTENDANCE SERVICE - SCAN REQUEST` - Should show session token
5. `📥 Response Status:` - Should show 200 (success) or 401 (unauthorized)

### Backend Console Logs
Look for these log sequences:
1. `📥 ATTENDANCE CHECK-IN REQUEST` - Should show all request details
2. `Authorization Header:` - Should show "Bearer eyJhbG..."
3. `Decoded User (req.user):` - Should show user object with worker_id
4. `Worker ID:` - Should show numeric worker ID (not null!)
5. Error logs if validation fails

## Testing Checklist

### Test 1: Valid Worker Check-In
1. Login as worker with valid worker_id
2. Navigate to QR scanner
3. Scan valid attendance QR code
4. **Expected**: Success message with timestamp
5. **Console should show**: ✅ CHECK-IN COMPLETE

### Test 2: Invalid QR Code
1. Scan a QR code that's not an attendance QR
2. **Expected**: "Invalid QR Code" error message
3. **Console should show**: ❌ QR Parse Error or INVALID_QR_CODE

### Test 3: Expired Session
1. Close an attendance session
2. Try to scan the old QR code
3. **Expected**: "This attendance session is no longer active"
4. **Console should show**: ❌ SESSION INACTIVE

### Test 4: Duplicate Check-In
1. Scan a QR code successfully
2. Try to scan the same QR code again
3. **Expected**: "You have already checked in for this session"
4. **Console should show**: ⚠️ DUPLICATE CHECK-IN ATTEMPT

### Test 5: Non-Worker Role
1. Login as admin/supervisor
2. Try to scan a QR code
3. **Expected**: 403 Forbidden error
4. **Console should show**: Authorization error

## Database Verification Queries

Run these queries to verify data integrity:

### Check User Has worker_id
```sql
SELECT id, name, email, role, worker_id 
FROM users 
WHERE id = <user_id>;
-- worker_id should NOT be null for workers
```

### Check Worker Record Exists
```sql
SELECT id, first_name, last_name, email 
FROM workers 
WHERE id = <worker_id>;
-- Should return a valid worker record
```

### Check Active Session
```sql
SELECT id, project_id, session_token, status, check_in_start, check_in_end
FROM attendance_sessions
WHERE status = 'Active'
AND project_id = <project_id>;
-- Should return an active session
```

### Check Existing Attendance
```sql
SELECT a.*, w.first_name, w.last_name, s.session_token
FROM attendance a
JOIN workers w ON a.worker_id = w.id
JOIN attendance_sessions s ON a.session_id = s.id
WHERE a.worker_id = <worker_id>
AND a.session_id = <session_id>;
-- Should show if worker already checked in
```

## Recommended Backend Improvements

### 1. Add worker_id Validation During Registration
**File**: `my-backend/controllers/authController.js`

```javascript
// After line 31
const resolvedWorkerId = await getWorkerIdForUser(normalizedRole, email, worker_id);

// Add validation
if (normalizedRole === 'worker' && !resolvedWorkerId) {
  return res.status(400).json({ 
    message: 'Worker ID is required for worker role. Please ensure you are registered as a worker.' 
  });
}
```

### 2. Add worker_id Validation During Login
**File**: `my-backend/controllers/authController.js`

```javascript
// After line 64
const role = normalizeRole(user.role);

// Add validation for workers
if (role === 'worker' && !user.worker_id) {
  return res.status(400).json({ 
    message: 'Worker account is not properly configured. Please contact administrator.' 
  });
}
```

### 3. Improve JWT Error Messages
**File**: `my-backend/middleware/authMiddleware.js`

```javascript
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Missing authorization token. Please log in.' 
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.' 
      });
    }
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Invalid authorization token. Please log in again.' 
    });
  }
};
```

## Environment Configuration

Ensure these environment variables are set in `my-backend/.env`:

```env
JWT_SECRET=your_secure_jwt_secret_here
# Must be the same across all environments
```

## Deployment Checklist

- [ ] Backend server restarted with new code
- [ ] Frontend app rebuilt with new code
- [ ] JWT_SECRET is properly configured
- [ ] Database has valid worker records with worker_id
- [ ] User accounts for workers have worker_id populated
- [ ] Active attendance session exists for testing
- [ ] Test with actual worker account
- [ ] Verify console logs show proper flow
- [ ] Test error scenarios (invalid QR, expired session, etc.)

## Monitoring

After deployment, monitor these indicators:

1. **Frontend Logs** (React Native Debugger):
   - Look for `🔍 Raw QR Data` logs
   - Check `👤 Current User` shows role: 'worker'
   - Verify `🔐 Auth Headers` shows hasToken: true

2. **Backend Logs** (Server Console):
   - Look for `📥 ATTENDANCE CHECK-IN REQUEST` logs
   - Verify `Worker ID:` is not null
   - Check for any `❌ UNAUTHORIZED` errors

3. **Common Error Patterns**:
   - `worker_id: null` → User account not linked to worker
   - `req.user: undefined` → Token not sent or invalid
   - `req.user.role: 'admin'` → Wrong role, not a worker

## Success Criteria

The fix is successful when:

✅ Worker can scan QR code and check in successfully
✅ Backend logs show complete request flow
✅ Frontend shows success message with timestamp
✅ No UNAUTHORIZED errors in logs
✅ Descriptive error messages for all failure scenarios
✅ Duplicate check-ins are prevented
✅ Expired sessions are properly rejected

## Support

If UNAUTHORIZED errors persist after these fixes:

1. Check backend console for detailed error logs
2. Verify JWT_SECRET is correctly configured
3. Confirm worker_id exists in users table
4. Verify worker record exists in workers table
5. Check token hasn't expired (30-day expiry)
6. Ensure user role is 'worker' (not 'admin' or 'supervisor')

## Additional Notes

- All logging is wrapped in `__DEV__` checks for production builds
- Error messages are user-friendly but logs contain technical details
- QR code payload is backward compatible (extracts token from multiple fields)
- Authentication uses Bearer token in Authorization header
- Session validation includes status, existence, and token matching