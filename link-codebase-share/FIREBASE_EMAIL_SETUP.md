# Firebase Email Setup for RentaKenya

## 🚀 Quick Setup Guide

### Step 1: Set up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security
   - Under "2-step verification" → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

### Step 2: Configure Environment Variables

Choose one of these methods:

#### Option A: Using Firebase CLI (Recommended)
```bash
# Set email credentials
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-16-char-app-password"

# Deploy functions
firebase deploy --only functions
```

#### Option B: Using .env file (Local Development)
Create `functions/.env` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
FROM_EMAIL=welcome@rentakenya.com
SALES_EMAIL=sales@rentakenya.com
```

### Step 3: Deploy Functions
```bash
firebase deploy --only functions
```

### Step 4: Test the System
1. Go to your RentaKenya page
2. Click "Start Free Trial"
3. Fill out the form
4. Check your email in 5 minutes!

## 📧 Email Configuration Options

### Gmail (Easiest Setup)
- Free for up to 500 emails/day
- Uses your existing Gmail account
- Requires app password (not regular password)

### SendGrid (Production Recommended)
- $15/month for 40,000 emails
- Professional email delivery
- Better deliverability rates
- Detailed analytics

To use SendGrid instead:
1. Sign up at sendgrid.com
2. Get your API key
3. Set: `firebase functions:config:set sendgrid.api_key="your-key"`
4. Uncomment SendGrid code in functions/index.js

## 🔍 Troubleshooting

### "Authentication failed" error
- Make sure you're using an App Password, not your regular Gmail password
- Enable 2-factor authentication first

### Emails not sending
- Check Firebase Functions logs: `firebase functions:log`
- Verify config: `firebase functions:config:get`

### "Permission denied" error
- Make sure you're logged in: `firebase login`
- Check project: `firebase projects:list`

## 📊 What Happens When Someone Signs Up

1. **Form Submitted** → Data saved to Firestore `trialSignups` collection
2. **Email Queued** → Added to `emailQueue` collection  
3. **Function Triggered** → `processEmailQueue` function runs automatically
4. **Emails Sent** → Welcome email to user + notification to sales team
5. **Status Updated** → Email marked as "sent" in queue

## 🎯 Next Steps

After emails are working:
1. Set up a proper domain (mail@rentakenya.com)
2. Add email tracking and analytics
3. Create automated follow-up sequences
4. Integrate with CRM system
