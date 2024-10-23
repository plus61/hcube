const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.post('/', async (req, res) => {
  const { action, settings } = req.body;

  if (action === 'send-email') {
    const { to, subject, text } = settings;
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
  } else if (action === 'update-smtp') {
    try {
      const { host, port, secure, auth } = settings;
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
      });

      // Test the connection
      await transporter.verify();

      process.env.SMTP_HOST = host;
      process.env.SMTP_PORT = port;
      process.env.SMTP_SECURE = secure;
      process.env.SMTP_USER = auth.user;
      process.env.SMTP_PASS = auth.pass;

      res.status(200).json({ message: 'SMTP settings updated and verified successfully' });
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      res.status(500).json({ message: 'Failed to update SMTP settings', error: error.message });
    }
  } else {
    res.status(400).json({ message: 'Invalid action' });
  }
});

module.exports.handler = serverless(app);