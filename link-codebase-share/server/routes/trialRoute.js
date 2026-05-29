const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Email configuration (using SendGrid as example)
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Trial signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessType,
      propertyCount,
      location,
      interests,
      timeline
    } = req.body;

    // Generate trial account credentials
    const trialId = uuidv4();
    const tempPassword = generateSecurePassword();
    const trialExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save to database (example with your existing DB structure)
    const trialAccount = {
      id: trialId,
      fullName,
      email,
      phone,
      businessType,
      propertyCount,
      location,
      interests,
      timeline,
      tempPassword,
      status: 'trial',
      expiryDate: trialExpiryDate,
      createdAt: new Date()
    };

    // Save to your database (adjust based on your DB structure)
    // await saveTrialAccount(trialAccount);

    // Send welcome email
    await sendTrialWelcomeEmail({
      email,
      fullName,
      trialId,
      tempPassword,
      expiryDate: trialExpiryDate
    });

    // Send notification to sales team
    await notifySalesTeam(trialAccount);

    // Track analytics
    await trackEvent('trial_signup', {
      email,
      businessType,
      propertyCount,
      location,
      source: 'rentakenya-landing'
    });

    res.status(201).json({
      success: true,
      message: 'Trial account created successfully',
      trialId,
      expiryDate: trialExpiryDate
    });

  } catch (error) {
    console.error('Trial signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trial account',
      error: error.message
    });
  }
});

// Email templates
const sendTrialWelcomeEmail = async ({ email, fullName, trialId, tempPassword, expiryDate }) => {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .header { background: linear-gradient(135deg, #51faaa, #3fd693); padding: 40px; text-align: center; }
        .content { padding: 40px; background: #ffffff; }
        .credentials { background: #f8fffe; border: 2px solid #51faaa; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #51faaa, #3fd693); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 12px; 
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: white; margin: 0;">Welcome to RentaKenya! 🎉</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your 30-day free trial is now active</p>
      </div>
      
      <div class="content">
        <h2>Hi ${fullName},</h2>
        
        <p>Congratulations! Your RentaKenya trial account has been created successfully. You now have access to all premium features for the next 30 days.</p>
        
        <div class="credentials">
          <h3>Your Trial Account Details:</h3>
          <p><strong>Trial ID:</strong> ${trialId}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
          <p><strong>Trial Expires:</strong> ${expiryDate.toLocaleDateString()}</p>
        </div>
        
        <a href="https://app.rentakenya.com/login?trial=${trialId}" class="button">
          Access Your Dashboard
        </a>
        
        <h3>What happens next:</h3>
        <ol>
          <li><strong>Access your dashboard</strong> - Click the button above to log in</li>
          <li><strong>Onboarding call</strong> - Our team will contact you within 24 hours</li>
          <li><strong>Explore features</strong> - Test M-Pesa integration, analytics, and more</li>
          <li><strong>Get support</strong> - Reach out anytime at support@rentakenya.com</li>
        </ol>
        
        <h3>Key Features to Try:</h3>
        <ul>
          <li>🔗 <strong>M-Pesa Integration</strong> - Connect your Safaricom account</li>
          <li>📊 <strong>Cash Flow Analytics</strong> - See predictive income reports</li>
          <li>📱 <strong>Tenant Portal</strong> - Let tenants pay and communicate digitally</li>
          <li>📄 <strong>Legal Compliance</strong> - Generate KRA-ready reports</li>
        </ul>
        
        <p>Questions? Reply to this email or call us at <a href="tel:+254700123456">+254 700 123 456</a></p>
        
        <p>Best regards,<br>
        The RentaKenya Team</p>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: '"RentaKenya Team" <welcome@rentakenya.com>',
    to: email,
    subject: '🎉 Welcome to RentaKenya - Your Trial is Active!',
    html: emailTemplate
  });
};

// Notify sales team
const notifySalesTeam = async (trialAccount) => {
  const salesNotification = `
    New RentaKenya Trial Signup 🎯
    
    Name: ${trialAccount.fullName}
    Email: ${trialAccount.email}
    Phone: ${trialAccount.phone}
    Business: ${trialAccount.businessType}
    Properties: ${trialAccount.propertyCount}
    Location: ${trialAccount.location}
    Timeline: ${trialAccount.timeline}
    Interests: ${trialAccount.interests.join(', ')}
    
    Trial ID: ${trialAccount.id}
    Signed up: ${new Date().toLocaleString()}
    
    Action Required: Schedule onboarding call within 24 hours
  `;

  return transporter.sendMail({
    from: '"RentaKenya System" <alerts@rentakenya.com>',
    to: 'sales@rentakenya.com',
    subject: `New Trial Signup: ${trialAccount.fullName} - ${trialAccount.propertyCount} properties`,
    text: salesNotification
  });
};

// Utility functions
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const trackEvent = async (eventType, data) => {
  // Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
  console.log(`Analytics Event: ${eventType}`, data);
};

module.exports = router;
