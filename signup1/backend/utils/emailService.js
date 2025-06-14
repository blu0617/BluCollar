const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email sending function
const sendJobAcceptedEmail = async ({ toEmail, customerName, workerName, jobDetails }) => {
  try {
    await transporter.sendMail({
      from: '"Servlyn" <ananyasingh172006@gmail.com>',
      to: toEmail,
      subject: `Your Service Request Has Been Accepted! - Servlyn`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #123459;">Service Request Accepted!</h1>
          <p>Dear ${customerName},</p>
          <p>Great news! Your service request has been accepted by <strong>${workerName}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #123459; margin-top: 0;">Service Details:</h3>
            ${jobDetails}
          </div>
          <p>Your service provider will contact you shortly.</p>
          <p>Thank you for choosing Servlyn!</p>
        </div>
      `,
    });
    console.log("📩 Email sent successfully to", toEmail);
    return true;
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    return false;
  }
};

module.exports = { sendJobAcceptedEmail }; 