const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Import M-Pesa functions
const { initiateMpesaPayment, mpesaCallback, queryMpesaPayment } = require('./mpesa');

// Email configuration using Gmail or SendGrid
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // your-email@gmail.com
    pass: 'YOUR_EMAIL_APP_PASSWORD' // your app password
  }
});

// Alternative: Using SendGrid
/*
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: functions.config().sendgrid.api_key
  }
});
*/

// Function to process email queue
exports.processEmailQueue = functions.firestore
  .document('emailQueue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    const emailId = context.params.emailId;
    
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
  
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to RentaKenya Trial</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5; 
        }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { 
          background: linear-gradient(135deg, #51faaa, #3fd693); 
          padding: 40px 20px; 
          text-align: center; 
        }
        .content { padding: 40px 20px; }
        .credentials { 
          background: #f8fffe; 
          border: 2px solid #51faaa; 
          border-radius: 12px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #51faaa, #3fd693); 
          color: white !important; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 12px; 
          font-weight: bold;
          margin: 20px 0;
        }
        .features { 
          background: #f9f9f9; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0; 
        }
        .footer { 
          background: #f0f0f0; 
          padding: 20px; 
          text-align: center; 
          color: #666; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to RentaKenya! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your 30-day free trial is now active</p>
        </div>
        
        <div class="content">
          <h2 style="color: #333;">Hi ${templateData.fullName},</h2>
          
          <p style="color: #555; line-height: 1.6;">Congratulations! Your RentaKenya trial account has been created successfully. You now have access to all premium features for the next 30 days.</p>
          
          <div class="credentials">
            <h3 style="color: #333; margin-top: 0;">🔑 Your Trial Account Details:</h3>
            <p style="margin: 8px 0;"><strong>Trial ID:</strong> <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 4px;">${templateData.trialId}</code></p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${recipientEmail}</p>
            <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 4px;">${templateData.tempPassword}</code></p>
            <p style="margin: 8px 0;"><strong>Trial Expires:</strong> ${templateData.expiryDate}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${templateData.dashboardUrl}" class="button">
              🚀 Access Your Dashboard
            </a>
          </div>
          
          <h3 style="color: #333;">📋 What happens next:</h3>
          <ol style="color: #555; line-height: 1.8;">
            <li><strong>Access your dashboard</strong> - Click the button above to log in</li>
            <li><strong>Onboarding call</strong> - Our team will contact you within 24 hours</li>
            <li><strong>Explore features</strong> - Test M-Pesa integration, analytics, and more</li>
            <li><strong>Get support</strong> - Reach out anytime at your-email@gmail.com</li>
          </ol>
          
          <div class="features">
            <h3 style="color: #333; margin-top: 0;">🌟 Key Features to Try:</h3>
            <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
              <li>🔗 <strong>M-Pesa Integration</strong> - Connect your Safaricom account for automatic payment processing</li>
              <li>📊 <strong>Cash Flow Analytics</strong> - See predictive income reports and tenant payment patterns</li>
              <li>📱 <strong>Tenant Portal</strong> - Let tenants pay rent and communicate digitally</li>
              <li>📄 <strong>Legal Compliance</strong> - Generate KRA-ready reports and tenancy agreements</li>
              <li>🤖 <strong>AI Insights</strong> - Get recommendations for rent pricing and vacancy optimization</li>
            </ul>
          </div>
          
          <p style="color: #555; line-height: 1.6;">Questions? Reply to this email or call us at <a href="tel:+254700123456" style="color: #51faaa;">+254 700 123 456</a></p>
          
          <p style="color: #555;">Best regards,<br>
          <strong>The RentaKenya Team</strong><br>
          🏢 Transforming Kenya's rental market</p>
        </div>
        
        <div class="footer">
          <p>RentaKenya | Nairobi, Kenya | <a href="mailto:your-email@gmail.com" style="color: #51faaa;">your-email@gmail.com</a></p>
          <p>This email was sent because you signed up for a RentaKenya trial account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: '"RentaKenya Team" <your-email@gmail.com>',
    to: recipientEmail,
    subject: '🎉 Welcome to RentaKenya - Your Trial is Active!',
    html: emailTemplate
  });
};

// Send sales notification
const sendSalesNotification = async (emailData) => {
  const { templateData } = emailData;
  
  const salesEmailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New RentaKenya Trial Signup</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ddd; border-radius: 8px; }
        .header { background: #51faaa; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .info-row { margin: 10px 0; padding: 8px; background: #f9f9f9; border-radius: 4px; }
        .priority { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Trial Signup</h1>
          <p>Action Required: Schedule onboarding call</p>
        </div>
        
        <div class="content">
          <div class="priority">
            <strong>⏰ Priority Action:</strong> Contact this prospect within 24 hours for onboarding call
          </div>
          
          <h3>👤 Contact Information:</h3>
          <div class="info-row"><strong>Name:</strong> ${templateData.fullName}</div>
          <div class="info-row"><strong>Email:</strong> <a href="mailto:${templateData.email}">${templateData.email}</a></div>
          <div class="info-row"><strong>Phone:</strong> <a href="tel:${templateData.phone}">${templateData.phone}</a></div>
          
          <h3>🏢 Business Details:</h3>
          <div class="info-row"><strong>Business Type:</strong> ${templateData.businessType}</div>
          <div class="info-row"><strong>Property Count:</strong> ${templateData.propertyCount}</div>
          <div class="info-row"><strong>Location:</strong> ${templateData.location}</div>
          <div class="info-row"><strong>Timeline:</strong> ${templateData.timeline}</div>
          <div class="info-row"><strong>Interests:</strong> ${templateData.interests}</div>
          
          <h3>📊 Trial Details:</h3>
          <div class="info-row"><strong>Trial ID:</strong> ${templateData.trialId}</div>
          <div class="info-row"><strong>Signup Time:</strong> ${templateData.signupTime}</div>
          
          <div style="margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 8px;">
            <h4>📞 Next Steps:</h4>
            <ol>
              <li>Call the prospect within 24 hours</li>
              <li>Schedule a personalized onboarding demo</li>
              <li>Focus on their specific property count and interests</li>
              <li>Add them to the CRM with trial details</li>
              <li>Follow up before trial expires (30 days)</li>
            </ol>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: '"RentaKenya System" <your-email@gmail.com>',
    to: emailData.recipientEmail,
    subject: `🎯 New Trial: ${templateData.fullName} - ${templateData.propertyCount} properties`,
    html: salesEmailTemplate
  });
};

// Function to clean up old email queue items (runs daily)
exports.cleanupEmailQueue = functions.pubsub
  .schedule('0 2 * * *') // Run at 2 AM daily
  .onRun(async (context) => {
    const db = admin.firestore();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const oldEmails = await db.collection('emailQueue')
      .where('createdAt', '<', threeDaysAgo)
      .get();
    
    const batch = db.batch();
    oldEmails.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${oldEmails.size} old email queue items`);
  });

// Export M-Pesa functions
exports.initiateMpesaPayment = initiateMpesaPayment;
exports.mpesaCallback = mpesaCallback;
exports.queryMpesaPayment = queryMpesaPayment;
