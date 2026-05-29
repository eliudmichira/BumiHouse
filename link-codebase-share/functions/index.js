const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Simple email configuration for testing
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eliudmichira7@gmail.com', // Your Gmail address
    pass: 'REDACTED' // Gmail app password without spaces
  }
});

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
    from: '"RentaKenya Team" <eliudmichira7@gmail.com>',
    to: recipientEmail,
    subject: '🎉 Welcome to RentaKenya - Your Trial is Active!',
    html: emailTemplate
  });
};

// Send sales notification
const sendSalesNotification = async (emailData) => {
  const { templateData } = emailData;
  
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
    from: '"RentaKenya System" <eliudmichira7@gmail.com>',
    to: 'sales@rentakenya.com', // Change to your sales email
    subject: `🎯 New Trial: ${templateData.fullName} - ${templateData.propertyCount} properties`,
    html: salesEmailTemplate
  });
};