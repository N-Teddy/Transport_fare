# Testing Authentication in Swagger

## Step-by-Step Guide

### 1. Start the Application
```bash
npm run start:dev
```

### 2. Access Swagger Documentation
Open your browser and go to: `http://localhost:3000/api/docs`

### 3. Test Authentication Flow

#### Step 1: Register a User (Optional)
- Go to the **Authentication** section
- Find the `POST /auth/register` endpoint
- Click "Try it out"
- Enter user details:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "role": "admin"
}
```
- Click "Execute"

#### Step 2: Login to Get Token
- Go to the **Authentication** section
- Find the `POST /auth/login` endpoint
- Click "Try it out"
- Enter credentials:
```json
{
  "username": "testuser",
  "password": "password123"
}
```
- Click "Execute"
- **Copy the `access_token` from the response**

#### Step 3: Authorize in Swagger
- Click the **"Authorize"** button at the top of the Swagger page
- In the authorization popup, enter: `Bearer YOUR_ACCESS_TOKEN`
  (Replace `YOUR_ACCESS_TOKEN` with the token you copied)
- Click "Authorize"
- Click "Close"

#### Step 4: Test Protected Routes
- Go to the **Users** section
- Try the `GET /users` endpoint
- Click "Try it out" and then "Execute"
- You should now get a successful response instead of 401 Unauthorized

## Troubleshooting

### If you still get 401 Unauthorized:

1. **Check Token Format**: Make sure you're using `Bearer ` prefix
2. **Check Token Expiration**: JWT tokens expire after 15 minutes by default
3. **Check Environment Variables**: Ensure JWT_SECRET is set
4. **Check Console Logs**: Look for any error messages in the terminal

### Common Issues:

1. **Token not copied correctly**: Make sure you copy the entire token
2. **Wrong Bearer format**: Use `Bearer <token>` not just `<token>`
3. **Expired token**: Get a new token by logging in again
4. **CORS issues**: The application should now handle CORS properly

### Debug Steps:

1. Check the browser's Network tab to see the actual request headers
2. Check the application logs for any authentication errors
3. Verify the token format in the Authorization header

## Expected Behavior

After following these steps:
- ✅ Login should return a valid JWT token
- ✅ Swagger should accept the token in the Authorize dialog
- ✅ Protected routes should return 200 OK instead of 401 Unauthorized
- ✅ You should see your user data in the response