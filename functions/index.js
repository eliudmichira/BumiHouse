const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');

admin.initializeApp();

// Email configuration from Firebase config or env vars — never hardcode credentials.
// Set with: firebase functions:config:set email.user="..." email.pass="..."
// (or the EMAIL_USER / EMAIL_PASS environment variables).
const EMAIL_USER = functions.config().email?.user || process.env.EMAIL_USER;
const EMAIL_PASS = functions.config().email?.pass || process.env.EMAIL_PASS;
const transporter = EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    })
  : null;

// Simple function to process email queue
exports.processEmailQueue = functions.firestore
  .document('emailQueue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();

    try {
      console.log('📧 Processing email:', emailData.type);

      if (emailData.type === 'trial_welcome') {
        await sendTrialWelcomeEmail(emailData);
      } else if (emailData.type === 'sales_notification') {
        await sendSalesNotification(emailData);
      }

      // Mark email as sent
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Email sent successfully');

    } catch (error) {
      console.error('❌ Error sending email:', error);

      // Mark email as failed
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Send trial welcome email
const sendTrialWelcomeEmail = async (emailData) => {
  const { recipientEmail, recipientName, templateData } = emailData;

  if (!transporter) {
    throw new Error('Email not configured: set EMAIL_USER/EMAIL_PASS or `firebase functions:config:set email.user=... email.pass=...`');
  }

  const emailTemplate = `
    <h1>Welcome to RentaKenya! 🎉</h1>
    <p>Hi ${templateData.fullName},</p>
    <p>Your trial account has been created successfully!</p>
    
    <h3>Your Trial Details:</h3>
    <ul>
      <li><strong>Trial ID:</strong> ${templateData.trialId}</li>
      <li><strong>Email:</strong> ${recipientEmail}</li>
      <li><strong>Password:</strong> ${templateData.tempPassword}</li>
      <li><strong>Expires:</strong> ${templateData.expiryDate}</li>
    </ul>
    
    <p><a href="https://dwellmate-285e8.web.app/trial-login" style="background: #51faaa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Your Trial Dashboard</a></p>
    
    <p>Questions? Reply to this email or contact support.</p>
    <p>Best regards,<br>The RentaKenya Team</p>
  `;

  return transporter.sendMail({
    from: `"RentaKenya Team" <${EMAIL_USER}>`,
    to: recipientEmail,
    subject: '🎉 Welcome to RentaKenya - Your Trial is Active!',
    html: emailTemplate
  });
};

// Send sales notification
const sendSalesNotification = async (emailData) => {
  const { templateData } = emailData;

  if (!transporter) {
    throw new Error('Email not configured: set EMAIL_USER/EMAIL_PASS or `firebase functions:config:set email.user=... email.pass=...`');
  }

  const salesEmailTemplate = `
    <h1>🎯 New Trial Signup</h1>
    <p><strong>Name:</strong> ${templateData.fullName}</p>
    <p><strong>Email:</strong> ${templateData.email}</p>
    <p><strong>Phone:</strong> ${templateData.phone}</p>
    <p><strong>Business:</strong> ${templateData.businessType}</p>
    <p><strong>Properties:</strong> ${templateData.propertyCount}</p>
    <p><strong>Location:</strong> ${templateData.location}</p>
    <p><strong>Timeline:</strong> ${templateData.timeline}</p>
    <p><strong>Trial ID:</strong> ${templateData.trialId}</p>
    <p><strong>Signed up:</strong> ${templateData.signupTime}</p>
    
    <p><strong>Action Required:</strong> Contact within 24 hours for onboarding call</p>
  `;

  return transporter.sendMail({
    from: `"RentaKenya System" <${EMAIL_USER}>`,
    to: 'sales@rentakenya.com', // Change to your sales email
    subject: `🎯 New Trial: ${templateData.fullName} - ${templateData.propertyCount} properties`,
    html: salesEmailTemplate
  });
};

// Resolve Google Maps short URLs to bypass CORS
exports.resolveShortUrl = functions.https.onCall(async (data, context) => {
  const { url } = data;

  if (!url) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "url" argument.');
  }

  // Basic validation that it's a known short URL domain
  if (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps')) {
    return { resolvedUrl: url }; // Return original if not a short link
  }

  try {
    console.log('🔗 Resolving URL:', url);
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 303, // Follow common redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // The final URL is in the request object of the response
    const resolvedUrl = response.request.res.responseUrl || response.request.href || url;
    console.log('✅ Resolved to:', resolvedUrl);

    return { resolvedUrl };
  } catch (error) {
    console.error('❌ Error resolving URL:', error.message);
    // If resolution fails, return original and let client-side query handle it
    return { resolvedUrl: url, error: error.message };
  }
});

/**
 * Send Push Notification on new notification document created
 * Trigger: users/{userId}/notifications/{notificationId}
 */
exports.sendPushNotification = functions.firestore
  .document('users/{userId}/notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userId = context.params.userId;

    // 1. Get FCM tokens for the user
    const tokensSnapshot = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('fcmTokens')
      .get();

    if (tokensSnapshot.empty) {
      console.log('📭 No FCM tokens found for user:', userId);
      return;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    // 2. Construct the payload
    const payload = {
      notification: {
        title: notification.title || 'New Notification',
        body: notification.body || '',
      },
      data: {
        url: notification.data?.url || '/notifications',
        type: notification.type || 'general',
        id: notification.id || snap.id
      }
    };

    // 3. Send via FCM
    const response = await admin.messaging().sendMulticast({
      tokens: tokens,
      ...payload
    });

    // 4. Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokensSnapshot.docs[idx].ref.delete());
        }
      });
      await Promise.all(failedTokens);
      console.log(`🧹 Cleaned up ${failedTokens.length} invalid tokens`);
    }

    console.log(`✅ Sent push to ${response.successCount} devices for user ${userId}`);
  });