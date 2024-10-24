const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

function getSmtpSettings() {
  return {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || '',
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  };
}

function createTransporter() {
  const settings = getSmtpSettings();
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });
}

// SMTP設定取得エンドポイント
app.get('/smtp-settings', (req, res) => {
  const settings = getSmtpSettings();
  res.json({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    user: settings.user
  });
});

// メール送信エンドポイント
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const transporter = createTransporter();
    await transporter.sendMail({
      from: getSmtpSettings().user,
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

module.exports.handler = serverless(app);
