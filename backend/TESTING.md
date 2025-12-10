# Local Testing Guide

## 🚀 Running the Server

### Step 1: Start the Development Server

```bash
cd /Users/rkjyothish/Personal/task-hub/backend
npm run dev
```

This will:
- Start the server on `http://localhost:3000` (or the port in your `.env`)
- Use `nodemon` for auto-restart on file changes
- Connect to your MongoDB database

**Expected output:**
```
[2025-12-10T...] [INFO] MongoDB Connected: taskcrusher-shard-00-02.s6xjc.mongodb.net
[2025-12-10T...] [INFO] Server running on port 3000
[2025-12-10T...] [INFO] Environment: development
```

### Step 2: Verify Server is Running

Open your browser or use curl:

```bash
# Test root endpoint
curl http://localhost:3000/

# Test health endpoint
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "uptime": 5,
  "timestamp": "2025-12-10T..."
}
```

## 🧪 Testing API Endpoints

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:3000/api/health
```

### 2. Sign Up (Create Account)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from the response!** You'll need it for other endpoints.

**Expected response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "title": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Sign In

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get Current User (Requires Auth)

Replace `YOUR_TOKEN` with the token from signup/signin:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Create a Task (Requires Auth)

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "priority": "high",
    "date": "2025-12-15",
    "timeStart": "09:00 AM",
    "timeEnd": "11:00 AM",
    "referenceLinks": ["https://example.com/docs"]
  }'
```

### 6. Get All Tasks (Requires Auth)

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Get Analytics Overview (Requires Auth)

```bash
curl -X GET http://localhost:3000/api/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. AI Chat (Requires Auth)

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me organize my tasks"
  }'
```

## 📝 Using a REST Client (Recommended)

### Option 1: Postman

1. Import the collection (create manually):
   - Base URL: `http://localhost:3000`
   - Create environment variable: `token` = your JWT token
   - Set Authorization header: `Bearer {{token}}`

### Option 2: VS Code REST Client Extension

Create `backend/test.http`:

```http
### Variables
@baseUrl = http://localhost:3000
@token = YOUR_TOKEN_HERE

### Health Check
GET {{baseUrl}}/api/health

### Sign Up
POST {{baseUrl}}/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

### Sign In
POST {{baseUrl}}/api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### Get Current User
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{token}}

### Create Task
POST {{baseUrl}}/api/tasks
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Test Task",
  "description": "This is a test task",
  "priority": "high",
  "date": "2025-12-15",
  "timeStart": "09:00 AM",
  "timeEnd": "10:00 AM"
}

### Get All Tasks
GET {{baseUrl}}/api/tasks
Authorization: Bearer {{token}}

### Get Analytics
GET {{baseUrl}}/api/analytics/overview
Authorization: Bearer {{token}}
```

## 🔍 Troubleshooting

### Server won't start

**Check:**
1. MongoDB connection string is correct in `.env`
2. Dependencies are installed: `npm install`
3. Port 3000 is not already in use

**Error: "MONGODB_URI is not defined"**
- Make sure `.env` file exists in `backend/` directory
- Check that `MONGODB_URI` is set correctly

**Error: "Port already in use"**
- Change `PORT` in `.env` to a different number (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill`

### Authentication errors

**"Authentication required"**
- Make sure you're including the `Authorization: Bearer <token>` header
- Token might be expired (default: 7 days)

**"Invalid token"**
- Get a new token by signing in again
- Check that token is copied correctly (no extra spaces)

### Database errors

**"Database connection failed"**
- Verify MongoDB connection string
- Check network connectivity
- Ensure database was initialized: `npm run init-db`

## ✅ Quick Test Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Can sign up a new user
- [ ] Can sign in with credentials
- [ ] Can get current user with token
- [ ] Can create a task
- [ ] Can get all tasks
- [ ] Can get analytics

## 🎯 Next Steps

Once local testing is successful:
1. Test all endpoints
2. Verify data is saved in MongoDB
3. Test error cases (invalid data, missing auth, etc.)
4. Ready for frontend integration!

