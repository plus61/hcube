import express from 'express';
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
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/send-email', async (req, res) => {
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
    res.status(500).json({ message: 'Failed to send email' });
  }
});

app.post('/api/update-smtp', (req, res) => {
  const { host, port, user, pass, fromEmail } = req.body;

  // Update transporter with new settings
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  // Update environment variables
  process.env.SMTP_HOST = host;
  process.env.SMTP_PORT = port;
  process.env.SMTP_USER = user;
  process.env.SMTP_PASS = pass;
  process.env.FROM_EMAIL = fromEmail;

  res.status(200).json({ message: 'SMTP settings updated successfully' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});