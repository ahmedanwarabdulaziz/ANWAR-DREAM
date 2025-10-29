# 🔐 Vercel Environment Variables Configuration

This document lists all the environment variables you need to add to your Vercel project settings.

## 📋 How to Add Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable below

## 🔥 Firebase Configuration (Public - Client-side)

These variables are exposed to the browser (`NEXT_PUBLIC_` prefix):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCxgAb3jpB35mDAXcbifMJHq9FxaHhYu5U
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cadeala-cd61d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cadeala-cd61d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cadeala-cd61d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=202865893881
NEXT_PUBLIC_FIREBASE_APP_ID=1:202865893881:web:85f345c1e8d1d246459d28
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Note:** Replace `your_measurement_id` with your actual Firebase Analytics Measurement ID if you're using Analytics.

---

## 🔒 Firebase Admin SDK (Private - Server-side only)

**⚠️ IMPORTANT:** These are sensitive credentials - never expose them to the client!

```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCrRtldWdOtAQi8\nhNuO3Mx7wWENHTiZP9F0tYbVkET2k8/7PSFZT29ilDTQJl6ywcFLHW71yikCiSos\nia71eLBbB8FwJYIIYynbeOo6mfcOjDr/prSBqIL722/W2+CAuyN4ETjUxi2IshFj\nMk8+Py7zR9Budf6EJpj05pJePmRf+1zcDPfheH3IhH4F69kRQCD/WfvPrYi8livz\nMdeUZSFgUfuHcJAvFLA2H+/LyAMj4exYbaDyheR7U0Kr/UdC1lntZ7KNmmitekb2\n1lcL5dQw4Sm+O8mxsKojgJLy3gUSKP5/Y8tzM5XGmsq3sQviowAX8mt4698N5SIN\num42BPnVAgMBAAECggEAL2Sy5/RfsMsM9lFTCbSKNqJbbwwLachxdnh2f2jk1FAx\naEVRkYt7+EynUoOTh6Y6jMTvu759W5DF5T4R9iW3svCx84zFbvm1jt/l/GI3LUTb\nXHtuDkSpPfTJ/SupcyWVWnd1gNb3qZAQZKD6sXA9Vx8jizVGQJ4HjBizHrXoA3Cv\n2NmtVNvgMTX+d+BsXqEi0eN8IWU2LIoSVj8Yy4OganLTsHrqqK/bSnuD6b2ey2S8\ns5KiDyTVkjbYXKKdjIKEMiouUia210n0BAs4eFwRyaWTxF0LYaYBGhezCDksyzkI\n9S2mzALh8KJp4rIfleMMbqEgy4yEwOoXApMLWFCNPwKBgQDh6cjzsugsltJIjt62\nBufLi5WLPWBltdTD3ha6fQiwFsCIe8eF94ZuUabRjL6gDcn4A9EhFvQoIsk8LtHi\nSjpQOVlBpQ7AijZKFKZkw/Oq/e5NfYMf18TZMopIUrQnQFfTW7ITbrfKz/sVC3Ly\n948Mzqrve+68TcJEY02+rVFnjwKBgQDCFk4thbJGNcfBacTc3YgI9Ajn2HMaUeNs\nL5jO+YbHlPnyVPPyy7714Eh+mK8+ftp7UxMvHsJoPqSnzumtq6pSNh9qqDNw/2tF\nOY1tYLv//wsXzE2iS8uiL2yk/Ov1EHLJ26QN3bzWHYgbL0uRWubbYlQbEwcVckqp\nexq/B3M2WwKBgQDN0Qr2Ewl5DhMYbakzVwk4pLuidlFreIQVyjEUx7LxkljoPzTg\ntUixGwyLHtnQwZ8+qGOP7PSV2FNT1Cf9LLkBu624o6LUAVdCmJubc/Z70wqXaIDc\nstwxMN1Q1KAynmklMwYCtD0XtfG/E4YvGyElfue2dUdkIMebPIlo7UgbuwKBgAW3\n+Ie4177f2MnnHujPEjIJVrXWF9YfsY6/fEYk7ga1agPs4t81h6Pg/uHUB93UiQV3\nNip+QoYlyl4zZ4k5dKRFefl/iTx8GiIJBxTA8+kgD6ic2XC9wPs/YHkgBqfK20b9\nVMEf1m+MoTUD2LsorYKrTAUcM2o7Wt3RhcE5K/jfAoGBANTzsGOXFr6fgEV/wIRQ\nF8VbyRsmMehm/tnnt66l8OQVvw2WWSlQisMSr/WDa5nHxuImG8/kx/CsCXeew2m8\noiGFGzZfTtvbQHgasGoBQ6m7J11FCHH/kxgqpCM7TAHvggvljfIwbpa1vP4sbkig\ntYcfxGIJQL881/j4+1kTX/vH\n-----END PRIVATE KEY-----\n"

FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@cadeala-cd61d.iam.gserviceaccount.com

FIREBASE_ADMIN_PROJECT_ID=cadeala-cd61d
```

**⚠️ Critical Notes for `FIREBASE_ADMIN_PRIVATE_KEY`:**
- Include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters as-is (they represent newlines)
- The value should be wrapped in quotes in Vercel
- Make sure there are no extra spaces or line breaks

---

## ☁️ Cloudinary Configuration

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dbo3xd0df

CLOUDINARY_API_KEY=984549417134457

CLOUDINARY_API_SECRET=zfKeoO4s5EUBljSHZYUmtBcUeSM

CLOUDINARY_URL=cloudinary://984549417134457:zfKeoO4s5EUBljSHZYUmtBcUeSM@dbo3xd0df
```

**Note:** `CLOUDINARY_API_SECRET` is server-side only (no `NEXT_PUBLIC_` prefix), so it won't be exposed to the browser.

---

## 🔔 Firebase Messaging (Optional - for Push Notifications)

If you're using Firebase Cloud Messaging:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

**Note:** Replace with your actual VAPID key from Firebase Console → Project Settings → Cloud Messaging.

---

## 🌐 App Configuration

```
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
```

**Note:** Replace with your actual Vercel deployment URL. For production, use your custom domain.

---

## ✅ Environment-Specific Settings

In Vercel, you can set different values for:
- **Production** (deployed to production)
- **Preview** (deployments from branches)
- **Development** (local development)

### Recommended:

1. **Production**: Use production URLs and settings
2. **Preview**: Can use same as production or staging settings
3. **Development**: Leave empty (will use `.env.local` file locally)

---

## 📝 Quick Copy-Paste Checklist

Add these to Vercel in this order:

### 1. Firebase Public (Client-side)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### 2. Firebase Admin (Server-side)
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PROJECT_ID`

### 3. Cloudinary
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `CLOUDINARY_URL`

### 4. App Settings
- [ ] `NEXT_PUBLIC_APP_URL`

### 5. Optional
- [ ] `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (if using push notifications)

---

## 🔍 Verification

After adding all variables:

1. **Redeploy** your Vercel project
2. Check the build logs for any missing variable warnings
3. Test Firebase authentication and Firestore operations
4. Test Cloudinary image uploads

---

## ⚠️ Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use `NEXT_PUBLIC_` prefix only for variables that are safe to expose
3. ✅ Keep server-side secrets (like `CLOUDINARY_API_SECRET` and `FIREBASE_ADMIN_PRIVATE_KEY`) private
4. ✅ Regularly rotate sensitive credentials
5. ✅ Use Vercel's environment-specific settings for different environments

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel build logs for missing variable errors
2. Verify variable names match exactly (case-sensitive)
3. Ensure `FIREBASE_ADMIN_PRIVATE_KEY` includes all newlines (`\n`)
4. Make sure Production/Preview/Development settings are configured correctly

