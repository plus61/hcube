// netlify/functions/api.mjs

import express from 'express';
import serverless from 'serverless-http';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// メール送信エンドポイント
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// SMTP設定更新エンドポイント
app.post('/update-smtp', async (req, res) => {
  try {
    const { host, port, secure, auth } = req.body;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
    });

    await transporter.verify();
    res.status(200).json({ message: 'SMTP settings updated and verified successfully' });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).json({ message: 'Failed to update SMTP settings', error: error.message });
  }
});

export const handler = serverless(app);