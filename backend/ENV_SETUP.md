# Environment Variables Setup Guide

## 📍 Location

Create your `.env` file in the **`backend/`** directory:

```
task-hub/
  backend/
    .env          ← Create this file here
    .env.example  ← Template (safe to commit)
    src/
    package.json
```

## 🔐 Required Environment Variables

### 1. **PORT** (Optional - has default)
```env
PORT=3000
```
- **What it is:** Server port number
- **Default:** 3000 (if not set)
- **Keep secret?** ❌ No - safe to share
- **Production:** Render sets this automatically, but you can override

### 2. **NODE_ENV** (Recommended)
```env
NODE_ENV=development
```
- **What it is:** Environment mode (development/production)
- **Options:** `development` | `production`
- **Keep secret?** ❌ No - safe to share
- **Production:** Set to `production` on Render

### 3. **MONGODB_URI** (Required)
```env
MONGODB_URI=mongodb://localhost:27017/taskhub
```
- **What it is:** MongoDB connection string
- **Development:** `mongodb://localhost:27017/taskhub` (local MongoDB)
- **Production:** MongoDB Atlas connection string
- **Keep secret?** ⚠️ **YES** - Contains database credentials
- **Format examples:**
  - Local: `mongodb://localhost:27017/taskhub`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/taskhub?retryWrites=true&w=majority`

### 4. **JWT_SECRET** (Required)
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```
- **What it is:** Secret key for signing JWT tokens
- **Keep secret?** 🔒 **YES - CRITICAL** - Never share or commit
- **How to generate:**
  ```bash
  # Generate a random secret (32+ characters recommended)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Production:** Use a strong, random string (at least 32 characters)

### 5. **JWT_EXPIRE** (Optional - has default)
```env
JWT_EXPIRE=7d
```
- **What it is:** JWT token expiration time
- **Default:** 7d (7 days)
- **Keep secret?** ❌ No - safe to share
- **Options:** `1h`, `24h`, `7d`, `30d`, etc.

## 📝 Complete .env File Template

### For Development (Local)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskhub
JWT_SECRET=dev_secret_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
```

### For Production (Render)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskhub?retryWrites=true&w=majority
JWT_SECRET=super_secure_random_string_at_least_32_characters_long
JWT_EXPIRE=7d
# PORT is set automatically by Render
```

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` file in `.gitignore` (already done)
- ✅ Use `.env.example` as a template (safe to commit)
- ✅ Generate strong, random `JWT_SECRET` for production
- ✅ Use MongoDB Atlas with strong password for production
- ✅ Never commit `.env` to version control
- ✅ Use different secrets for development and production

### ❌ DON'T:
- ❌ Never commit `.env` file
- ❌ Never share `JWT_SECRET` or `MONGODB_URI` publicly
- ❌ Don't use weak secrets like "secret123"
- ❌ Don't use the same secrets across environments

## 🚀 Setting Up on Render

1. **Go to your Render dashboard**
2. **Select your service**
3. **Go to "Environment" tab**
4. **Add these variables:**

| Key | Value | Secret? |
|-----|-------|---------|
| `NODE_ENV` | `production` | No |
| `MONGODB_URI` | Your MongoDB Atlas connection string | **Yes** |
| `JWT_SECRET` | Strong random string (32+ chars) | **Yes** |
| `JWT_EXPIRE` | `7d` | No |

**Note:** `PORT` is automatically set by Render - don't override it.

## 🧪 Quick Setup Commands

### Create .env file:
```bash
cd backend
cp .env.example .env
# Then edit .env and update the values
```

### Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verify .env is ignored:
```bash
git check-ignore .env
# Should output: .env
```

## 📋 Checklist

- [ ] Created `.env` file in `backend/` directory
- [ ] Set `MONGODB_URI` (local or Atlas)
- [ ] Generated strong `JWT_SECRET` (32+ characters)
- [ ] Set `NODE_ENV` appropriately
- [ ] Verified `.env` is in `.gitignore`
- [ ] For production: Set all variables in Render dashboard

## 🆘 Troubleshooting

**"MONGODB_URI is not defined"**
- Make sure `.env` file exists in `backend/` directory
- Check that variable name is exactly `MONGODB_URI`
- Restart the server after creating/updating `.env`

**"JWT_SECRET is not defined"**
- Add `JWT_SECRET` to your `.env` file
- Use a strong, random string

**Port already in use**
- Change `PORT` in `.env` to a different number (e.g., 3001)
- Or kill the process using port 3000

