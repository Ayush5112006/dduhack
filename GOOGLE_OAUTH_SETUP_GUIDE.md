# Google OAuth Setup Guide

## 🚨 Current Issue

You're experiencing an OAuth redirect URI mismatch error. The Google OAuth flow is trying to redirect to:
```
http://localhost:64759/oauth-callback
```

But your application expects:
```
http://localhost:3000/auth/callback/google
```

## ✅ Solution: Complete Setup Steps

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Required APIs**
   - Go to **APIs & Services** → **Library**
   - Search for and enable:
     - **Google+ API** (or **People API**)
     - **Google OAuth2 API**

4. **Configure OAuth Consent Screen**
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (for testing) or **Internal** (for organization)
   - Fill in the required fields:
     - App name: `DDU Hackathon Platform`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes (optional for basic auth):
     - `userinfo.email`
     - `userinfo.profile`
   - Add test users if using External type
   - Click **Save and Continue**

5. **Create OAuth 2.0 Client ID**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `DDU Hackathon Web Client`
   
6. **Configure Authorized Redirect URIs** ⚠️ **CRITICAL**
   
   Add these exact URIs:
   
   **For Local Development:**
   ```
   http://localhost:3000/auth/callback/google
   ```
   
   **For Production (when deploying):**
   ```
   https://yourdomain.com/auth/callback/google
   ```
   
   **For Vercel Deployment:**
   ```
   https://your-app-name.vercel.app/auth/callback/google
   ```

7. **Copy Your Credentials**
   - After creating, you'll see:
     - **Client ID**: Starts with something like `1071006060591-...`
     - **Client Secret**: A random string
   - **IMPORTANT**: Keep these secure!

### Step 2: Update Your `.env.local` File

I've already added the configuration template to your `.env.local` file. Now you need to replace the placeholder values:

1. Open `.env.local` in your editor
2. Find these lines:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
   GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
   ```

3. Replace with your actual credentials:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="1071006060591-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### Step 3: Restart Your Development Server

After updating the environment variables, you **MUST** restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the OAuth Flow

1. Go to `http://localhost:3000/auth/login`
2. Click the **Sign in with Google** button
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back to your app at `/dashboard`

## 🔍 Troubleshooting

### Error: "Redirect URI Mismatch"

**Cause**: The redirect URI in Google Console doesn't match your app's callback URL.

**Solution**:
- Double-check the redirect URI in Google Console is **exactly**:
  ```
  http://localhost:3000/auth/callback/google
  ```
- No trailing slashes
- Correct protocol (`http://` for localhost, `https://` for production)
- Correct port (`:3000`)

### Error: "Invalid Client ID"

**Cause**: The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is incorrect or missing.

**Solution**:
- Verify you copied the entire Client ID from Google Console
- Make sure there are no extra spaces or quotes
- Restart your dev server after updating `.env.local`

### Error: "Access Blocked: Authorization Error"

**Cause**: Your app is not verified or the user is not added as a test user.

**Solution**:
- In Google Console → OAuth consent screen
- Add your email as a test user
- Or publish your app (requires verification for production)

### Error: "Config Missing"

**Cause**: Environment variables are not loaded.

**Solution**:
- Make sure `.env.local` exists in the root directory
- Restart your dev server
- Check that the file is not named `.env.local.txt` or similar

## 📋 Checklist

Before testing, ensure:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI set to `http://localhost:3000/auth/callback/google`
- [ ] Client ID copied to `.env.local`
- [ ] Client Secret copied to `.env.local`
- [ ] Development server restarted
- [ ] No typos in environment variable names
- [ ] `.env.local` is in the project root directory

## 🚀 Production Deployment

When deploying to production (e.g., Vercel):

1. **Add Production Redirect URI** in Google Console:
   ```
   https://yourdomain.com/auth/callback/google
   ```

2. **Set Environment Variables** in your hosting platform:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

3. **Update OAuth Consent Screen**:
   - Change from "Testing" to "In Production"
   - Complete the verification process if needed

## 📞 Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Check the server terminal for backend errors
3. Verify all environment variables are set correctly
4. Ensure the redirect URI matches exactly (case-sensitive)

## 🔐 Security Notes

- **Never commit** `.env.local` to Git (it's already in `.gitignore`)
- **Never share** your Client Secret publicly
- **Rotate credentials** if they're ever exposed
- Use different credentials for development and production
