import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (toEmail, token) => {
  const url = `https://yourfrontend.com/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: '"Your SaaS" <no-reply@yourdomain.com>',
    to: toEmail,
    subject: "Verify your email",
    html: `<p>Please click the link to verify your email:</p><a href="${url}">${url}</a>`,
  });

  console.log("Verification email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
