# Firebase Security Rules Configuration

This document outlines the recommended security rules for your Firebase project to protect your data while maintaining functionality.

## Important Security Notice

⚠️ **CRITICAL**: Your Firebase API keys are currently exposed in `firebase-config.js`. This is normal for frontend applications, but you MUST configure proper security rules to protect your data.

## Current Collections

Your application uses the following Firestore collections:
- `contact-submissions` - Stores contact form submissions from the website

## Recommended Security Rules

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `iwdogs-2e4c1`
3. Navigate to **Firestore Database** → **Rules**

### Step 2: Apply These Security Rules

Copy and paste the following rules into your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Contact Submissions Collection
    // Public can write (submit forms), only authenticated admins can read
    match /contact-submissions/{submissionId} {
      // Allow anyone to create new submissions (contact form)
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'message', 'timestamp'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.name.size() <= 100
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('.*@.*\\..*')
                    && request.resource.data.message is string
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 5000;

      // Only authenticated users can read submissions
      allow read: if request.auth != null;

      // Only authenticated users can update/delete
      allow update, delete: if request.auth != null;
    }

    // Dogs Collection (for future use)
    match /dogs/{dogId} {
      // Public can read dog profiles
      allow read: if true;

      // Only authenticated admins can write
      allow write: if request.auth != null;
    }

    // Litters Collection (for future use)
    match /litters/{litterId} {
      // Public can read litter information
      allow read: if true;

      // Only authenticated admins can write
      allow write: if request.auth != null;
    }

    // Puppies Collection (for future use)
    match /puppies/{puppyId} {
      // Public can read available puppies
      allow read: if true;

      // Only authenticated admins can write
      allow write: if request.auth != null;
    }

    // Applications Collection (for future use)
    match /applications/{applicationId} {
      // Users can create applications
      allow create: if true;

      // Only authenticated admins can read/update/delete
      allow read, update, delete: if request.auth != null;
    }

    // Waitlist Collection (for future use)
    match /waitlist/{waitlistId} {
      // Users can add themselves to waitlist
      allow create: if true;

      // Only authenticated admins can read/update/delete
      allow read, update, delete: if request.auth != null;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Test Your Rules

After applying the rules, test them:

1. **Test Public Form Submission**:
   - Go to your website
   - Submit the contact form
   - Should work successfully

2. **Test Admin Access**:
   - Log in to your admin panel
   - Try to view contact submissions
   - Should work after authentication

3. **Test Unauthorized Access**:
   - Open browser console
   - Try to read contact-submissions without auth
   - Should be denied

## Security Features Implemented

✅ **Input Validation**
- Name: 1-100 characters
- Email: Valid email format
- Message: 1-5000 characters
- Required fields enforced

✅ **Access Control**
- Public can submit forms
- Only authenticated users can read submissions
- Only authenticated users can modify data

✅ **Rate Limiting** (recommended)
Firebase has built-in rate limiting, but consider:
- Enable App Check for additional protection
- Monitor usage in Firebase Console
- Set up billing alerts

## Additional Security Measures

### 1. Enable Firebase App Check

App Check helps protect your backend resources from abuse:

1. Go to Firebase Console → App Check
2. Enable App Check for your web app
3. Add the App Check SDK to your site:

```javascript
// Add to firebase-config.js
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR-RECAPTCHA-SITE-KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### 2. Monitor Usage

Set up monitoring to detect unusual activity:

1. Go to Firebase Console → Usage and Billing
2. Set up billing alerts
3. Enable Cloud Functions logging
4. Review Firestore usage regularly

### 3. Secure Authentication

Your admin authentication is currently configured. Best practices:

- ✅ Use strong passwords
- ✅ Enable 2FA for admin accounts
- ⚠️ Don't share admin credentials
- ⚠️ Regularly review authorized users
- ⚠️ Use password manager for credentials

### 4. API Key Restrictions

While Firebase API keys are safe to expose, you can add restrictions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find your API key
4. Add application restrictions:
   - HTTP referrers: `iwdogs.com`, `www.iwdogs.com`

### 5. Backup Strategy

Regularly backup your Firestore data:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export data
firebase firestore:export gs://iwdogs-2e4c1.appspot.com/backups/$(date +%Y%m%d)
```

Or use the Firebase Console to schedule automated backups.

## Testing Checklist

- [ ] Security rules applied in Firebase Console
- [ ] Public form submission works
- [ ] Unauthenticated users cannot read submissions
- [ ] Admin login works
- [ ] Admin can view submissions after login
- [ ] Admin can export submissions
- [ ] Rate limiting tested (multiple rapid submissions)
- [ ] App Check enabled (optional but recommended)
- [ ] Billing alerts configured
- [ ] Backup strategy in place

## Troubleshooting

### Problem: Form submission fails with "permission denied"

**Solution**: Check that your security rules allow public `create` access to `contact-submissions`

### Problem: Admin can't view submissions

**Solution**:
1. Verify admin is logged in (check Firebase Auth Console)
2. Ensure security rules allow authenticated users to read
3. Check browser console for errors

### Problem: Too many submissions (spam)

**Solution**:
1. Enable App Check with reCAPTCHA
2. Add client-side rate limiting
3. Review and delete spam in Firebase Console
4. Consider adding a honeypot field to the form

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)

## Security Updates

Last reviewed: 2026-01-13

**Recommendation**: Review security rules quarterly or when:
- Adding new collections
- Changing application features
- After security incidents
- When Firebase releases security updates
