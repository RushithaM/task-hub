# Task Hub Backend API

Express.js backend API for Task Hub - A modern task management application.

## 🛠 Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **ES Modules** - Modern JavaScript modules

## 📁 Project Structure

```
backend/
  src/
    app.js                    # Main Express application
    routes/
      index.js               # Route aggregator
      auth.routes.js         # Authentication routes
      tasks.routes.js        # Task management routes
      analytics.routes.js    # Analytics routes
      user.routes.js         # User profile routes
      ai.routes.js           # AI assistant routes
    controllers/
      health.controller.js   # Health check controller
      auth.controller.js     # Authentication controllers
      tasks.controller.js    # Task controllers
      analytics.controller.js # Analytics controllers
      user.controller.js    # User controllers
      ai.controller.js       # AI controllers
    services/
      auth.service.js        # Authentication business logic
      tasks.service.js       # Task business logic
      analytics.service.js   # Analytics business logic
      user.service.js        # User business logic
      ai.service.js          # AI service logic
    models/
      User.js               # User model
      Task.js               # Task model
    middlewares/
      errorHandler.js        # Centralized error handler
      auth.middleware.js    # JWT authentication middleware
      validation.middleware.js # Request validation middleware
    utils/
      logger.js             # Logging utility
      db.js                 # Database connection
      jwt.js                # JWT utilities
      validation.js         # Validation helpers
  .env.example              # Environment variables example
  .gitignore                # Git ignore file
  package.json              # Dependencies and scripts
  README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

3. **Start MongoDB:**

Make sure MongoDB is running locally or update `MONGODB_URI` to point to your MongoDB instance.

4. **Run the development server:**

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

5. **Run in production:**

```bash
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Response Format

All responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type"
}
```

### Endpoints

#### Health Check

- **GET** `/api/health`
  - Returns server status, uptime, and timestamp
  - No authentication required

#### Authentication

- **POST** `/api/auth/signup`
  - Create a new user account
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`
  - Returns: User object and JWT token

- **POST** `/api/auth/signin`
  - Sign in with email and password
  - Body: `{ "email": "john@example.com", "password": "password123" }`
  - Returns: User object and JWT token

- **POST** `/api/auth/logout`
  - Logout (client-side token removal)
  - Requires authentication

- **GET** `/api/auth/me`
  - Get current user information
  - Requires authentication

#### Tasks

- **GET** `/api/tasks`
  - Get all tasks (with optional filters)
  - Query params: `date`, `month`, `status`, `priority`
  - Requires authentication

- **GET** `/api/tasks/:id`
  - Get single task by ID
  - Requires authentication

- **POST** `/api/tasks`
  - Create a new task
  - Body: `{ "title": "Task title", "description": "...", "priority": "high", "date": "2025-12-01", "timeStart": "09:00 AM", "timeEnd": "10:00 AM", "referenceLinks": ["https://example.com"] }`
  - Requires authentication

- **PUT** `/api/tasks/:id`
  - Update a task
  - Body: Same as POST (all fields optional)
  - Requires authentication

- **DELETE** `/api/tasks/:id`
  - Delete a task
  - Requires authentication

- **PATCH** `/api/tasks/:id/complete`
  - Toggle task completion status
  - Requires authentication

#### Analytics

- **GET** `/api/analytics/overview`
  - Get dashboard overview statistics
  - Query params: `month` (optional, YYYY-MM format)
  - Requires authentication

- **GET** `/api/analytics/task-status`
  - Get task status distribution
  - Query params: `month` (optional)
  - Requires authentication

- **GET** `/api/analytics/weekly-distribution`
  - Get weekly task distribution
  - Query params: `week` (optional, YYYY-WW format)
  - Requires authentication

- **GET** `/api/analytics/priority-distribution`
  - Get priority distribution
  - Query params: `month` (optional)
  - Requires authentication

- **GET** `/api/analytics/monthly-trend`
  - Get monthly completion trend
  - Query params: `months` (optional, default: 9)
  - Requires authentication

#### User Profile

- **GET** `/api/user/profile`
  - Get user profile
  - Requires authentication

- **PUT** `/api/user/profile`
  - Update user profile
  - Body: `{ "name": "New Name", "title": "New Title" }`
  - Requires authentication

- **PUT** `/api/user/password`
  - Change password
  - Body: `{ "currentPassword": "oldpass", "newPassword": "newpass" }`
  - Requires authentication

#### AI Assistant

- **POST** `/api/ai/chat`
  - Send message to AI assistant
  - Body: `{ "message": "Help me organize my tasks" }`
  - Requires authentication

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **JWT Authentication** - Token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Request validation middleware
- **Error Handling** - Centralized error handling

## 🗄 Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  title: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  title: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  priority: String (enum: 'low', 'medium', 'high'),
  timeStart: String,
  timeEnd: String,
  time: String,
  referenceLinks: [String],
  date: Date (required),
  completed: Boolean (default: false),
  userId: ObjectId (required, ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚢 Deployment on Render

### Steps

1. **Create a new Web Service on Render**

2. **Connect your repository**

3. **Configure build settings:**
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`

4. **Set environment variables:**
   - `PORT` - Will be set automatically by Render
   - `NODE_ENV=production`
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong secret key
   - `JWT_EXPIRE=7d`

5. **Deploy**

### MongoDB Setup

For production, use MongoDB Atlas (cloud MongoDB):

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Add it to Render environment variables as `MONGODB_URI`

## 🧪 Testing

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Sign In:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Tasks (with token):**
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for base URL and token
3. Use the token from signup/signin in Authorization header

## 📝 Code Standards

- **ES Modules** - All files use `import/export`
- **Separation of Concerns** - Controllers handle HTTP, Services contain business logic
- **Error Handling** - Centralized error handler with consistent error responses
- **Validation** - Request validation middleware for all inputs
- **Logging** - Logger utility for all operations
- **Security** - JWT authentication, password hashing, input validation

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity to MongoDB instance

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process using the port

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify token format in Authorization header

## 📄 License

MIT

## 🤝 Contributing

1. Follow the code standards
2. Use ES modules
3. Add proper error handling
4. Include validation for all inputs
5. Update documentation for new features

