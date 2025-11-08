# Firebase Setup Guide for IWDOGS Website

Complete step-by-step guide to set up Firebase backend for your website.

## What You're Getting

✅ **Contact Form Backend** - All submissions saved to Firebase database
✅ **Admin Login System** - Secure authentication
✅ **Admin Dashboard** - View, manage, and export submissions
✅ **Real-time Updates** - See new submissions instantly
✅ **FREE Hosting** - Firebase hosting included
✅ **No Server Needed** - Fully serverless solution

---

## Step 1: Create Firebase Project (5 minutes)

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. **Project name:** `iwdogs` (or any name you like)
3. Click **Continue**
4. **Google Analytics:** Optional (you can disable for simpler setup)
5. Click **Create project**
6. Wait for project creation (30 seconds)
7. Click **Continue**

---

## Step 2: Set Up Web App (3 minutes)

### 2.1 Register Web App
1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. **App nickname:** `IWDOGS Website`
3. **Don't** check "Firebase Hosting" yet (we'll do it later)
4. Click **Register app**

### 2.2 Copy Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "iwdogs-xxxxx.firebaseapp.com",
  projectId: "iwdogs-xxxxx",
  storageBucket: "iwdogs-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

**COPY ALL THESE VALUES** - you'll need them in Step 5.

---

## Step 3: Enable Authentication (2 minutes)

### 3.1 Set Up Email/Password Auth
1. In left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click **Sign-in method** tab
4. Click **Email/Password**
5. **Enable** the toggle
6. Click **Save**

### 3.2 Create Admin User
1. Click **Users** tab
2. Click **Add user**
3. **Email:** Your admin email (e.g., `admin@iwdogs.com`)
4. **Password:** Create a strong password (save it somewhere safe!)
5. Click **Add user**

✅ **Important:** Save these credentials - you'll use them to log into the admin dashboard!

---

## Step 4: Set Up Firestore Database (3 minutes)

### 4.1 Create Database
1. In left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. **Secure rules for Cloud Firestore:** Select **Start in test mode**
4. Click **Next**
5. **Location:** Choose closest to you (e.g., `us-central` for USA)
6. Click **Enable**

### 4.2 Deploy Security Rules
We'll deploy proper security rules in Step 7.

---

## Step 5: Configure Your Website Files (5 minutes)

### 5.1 Update firebase-config.js
Open the file `firebase-config.js` in your project and replace the placeholder values:

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // ...
};
```

**After (use YOUR values from Step 2.2):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA...",  // ← Your actual API key
    authDomain: "iwdogs-xxxxx.firebaseapp.com",  // ← Your actual auth domain
    projectId: "iwdogs-xxxxx",  // ← Your actual project ID
    storageBucket: "iwdogs-xxxxx.appspot.com",  // ← Your actual storage bucket
    messagingSenderId: "123456789",  // ← Your actual sender ID
    appId: "1:123456789:web:xxxxx"  // ← Your actual app ID
};
```

Save the file.

---

## Step 6: Install Firebase CLI (3 minutes)

### 6.1 Install Node.js (if not installed)
Download from: https://nodejs.org/
Choose the LTS (Long Term Support) version.

### 6.2 Install Firebase Tools
Open terminal/command prompt and run:

```bash
npm install -g firebase-tools
```

### 6.3 Login to Firebase
```bash
firebase login
```

This will open your browser to log in with your Google account.

---

## Step 7: Deploy to Firebase (5 minutes)

### 7.1 Initialize Firebase in Project
Navigate to your project folder in terminal:

```bash
cd /home/user/IWDOGS
```

Initialize Firebase:

```bash
firebase init
```

You'll be asked several questions:

1. **Which Firebase features?**
   ✅ Select: **Firestore** and **Hosting** (use Space to select, Enter to continue)

2. **Use an existing project?**
   ✅ Select: **Use an existing project**
   Choose your `iwdogs-xxxxx` project

3. **Firestore rules file?**
   ✅ Press Enter (use default: `firestore.rules`)

4. **Firestore indexes file?**
   ✅ Press Enter (use default: `firestore.indexes.json`)

5. **What do you want to use as your public directory?**
   Type: `.` (period) then press Enter
   ⚠️ Important: Use `.` not `public`!

6. **Configure as a single-page app?**
   ✅ Type: **N** (No)

7. **Set up automatic builds?**
   ✅ Type: **N** (No)

### 7.2 Deploy Everything
```bash
firebase deploy
```

Wait for deployment to complete (1-2 minutes).

---

## Step 8: Test Your Website (2 minutes)

### 8.1 Get Your Website URL
After deployment, you'll see:
```
Hosting URL: https://iwdogs-xxxxx.web.app
```

### 8.2 Test Contact Form
1. Open your website URL
2. Go to the Contact section
3. Fill out and submit the form
4. You should see "Thank You!" message

### 8.3 Test Admin Login
1. Go to: `https://iwdogs-xxxxx.web.app/admin.html`
2. Login with the email/password you created in Step 3.2
3. You should see the dashboard with your test submission!

---

## Step 9: Connect Custom Domain (Optional)

### 9.1 Add Custom Domain
1. In Firebase Console → **Hosting**
2. Click **Add custom domain**
3. Enter: `www.iwdogs.com`
4. Click **Continue**

### 9.2 Verify Ownership
Follow the DNS verification steps shown.

### 9.3 Update DNS Records
Add the A and TXT records to your domain provider (where you bought iwdogs.com).

Firebase will automatically provision SSL certificate.

---

## File Structure Overview

Here's what each file does:

```
IWDOGS/
├── index.html              # Main website
├── admin.html              # Admin login page
├── dashboard.html          # Admin dashboard
├── styles.css              # All styles
├── script.js               # Main website JS
├── firebase-config.js      # Firebase configuration ← YOU EDIT THIS
├── firebase-form.js        # Form submission handler
├── admin-auth.js           # Admin login logic
├── dashboard.js            # Dashboard logic
├── firebase.json           # Firebase hosting config
├── firestore.rules         # Database security rules
└── firestore.indexes.json  # Database indexes
```

---

## Important URLs to Bookmark

After setup, bookmark these:

- **Website:** `https://iwdogs-xxxxx.web.app` (or your custom domain)
- **Admin Login:** `https://iwdogs-xxxxx.web.app/admin.html`
- **Firebase Console:** `https://console.firebase.google.com/project/iwdogs-xxxxx`

---

## Daily Usage

### To View Submissions:
1. Go to admin URL
2. Login with your admin credentials
3. View all submissions in dashboard
4. Click "Export to Excel" to download

### To Deploy Updates:
After making changes to the website:

```bash
cd /home/user/IWDOGS
firebase deploy
```

---

## Troubleshooting

### Issue: "Firebase is not defined"
**Solution:** Make sure you updated `firebase-config.js` with your actual project credentials.

### Issue: Can't login to admin
**Solution:**
1. Check you're using the correct email/password
2. Verify the user exists in Firebase Console → Authentication → Users

### Issue: Form submissions not appearing
**Solution:**
1. Open browser console (F12) for errors
2. Check Firebase Console → Firestore Database → contact-submissions collection
3. Verify Firestore rules are deployed

### Issue: "Permission denied" errors
**Solution:** Run `firebase deploy --only firestore:rules`

---

## Cost Breakdown

Firebase free tier includes:
- ✅ **10GB Hosting Storage**
- ✅ **10GB/month Transfer**
- ✅ **50,000 Document reads/day**
- ✅ **20,000 Document writes/day**
- ✅ **Authentication** (unlimited)

**For this website:** FREE
Your traffic won't exceed free tier limits.

---

## Security Best Practices

✅ **Done for you:**
- Firestore rules restrict write access to authenticated users only
- Contact form allows public submissions (necessary)
- Admin dashboard requires login

⚠️ **You should:**
- Use a strong admin password
- Don't share admin credentials
- Regularly export submissions and back them up

---

## Getting Help

**Firebase Documentation:**
https://firebase.google.com/docs

**Firestore:**
https://firebase.google.com/docs/firestore

**Hosting:**
https://firebase.google.com/docs/hosting

**Need Support?**
- Firebase Community: https://firebase.google.com/support
- Stack Overflow: Tag questions with `firebase`

---

## Next Steps

After setup is complete:

1. ✅ Test form submission
2. ✅ Test admin login and dashboard
3. ✅ Add real images (see IMAGE_GUIDE.md)
4. ✅ Update content as needed
5. ✅ Point custom domain (optional)
6. ✅ Share admin URL with any team members

---

## Quick Reference Commands

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Open Firebase console
firebase open

# View hosting logs
firebase hosting:logs
```

---

**Congratulations! Your website now has a fully functional backend! 🎉**

