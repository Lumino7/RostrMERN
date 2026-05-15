const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "ab2b05001@smtp-brevo.com",
    pass: process.env.SMTP_KEY,
  },
});

const sendShiftEmail = async (email, name, shiftDate) => {
  try {
    await transporter.sendMail({
      from: '"Rostr Notifications" <rostrnotifications@gmail.com>',
      to: email,
      subject: "Shift Updated",
      text: `Hi ${name}, your shift on ${shiftDate} has been updated. Please check Rostr.`,
      html: `<b>Hi ${name},</b><p>Your shift on ${shiftDate} has been updated. Please check Rostr.</p>`,
    });
  } catch (err) {
    console.error("Email failed:", err);
  }
};

module.exports = sendShiftEmail;
