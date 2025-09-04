import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// --- Gmail Transporter ---
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,          // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
  },
});

// --- Send Email Function ---
export async function sendEmail(to, subject, text) {
  const from = process.env.FROM_EMAIL || process.env.GMAIL_USER;

  try {
    await gmailTransporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.log(`📨 Email sent via Gmail → ${to}`);
  } catch (err) {
    console.error("Gmail email error:", err);
  }
}
