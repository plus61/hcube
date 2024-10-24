const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const dataFilePath = path.join(__dirname, 'data.json');

let smtpSettings = {
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT || '',
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || ''
};

function createTransporter() {
  return nodemailer.createTransport({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure,
    auth: {
      user: smtpSettings.user,
      pass: smtpSettings.pass,
    },
  });
}

let transporter = createTransporter();

function validateEnvVariables() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'API_KEY'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`Missing required environment variable: ${varName}`);
      process.exit(1);
    }
  }
}

validateEnvVariables();

// 認証ミドルウェア
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// SMTP設定取得エンドポイント
app.get('/smtp-settings', authenticate, (req, res) => {
  res.json({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure,
    user: smtpSettings.user
  });
});

// SMTP設定更新エンドポイント
app.post('/update-smtp', authenticate, (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body;
    smtpSettings = { host, port, secure, user, pass };
    transporter = createTransporter();
    res.json({ message: 'SMTP settings updated successfully' });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).json({ message: 'Failed to update SMTP settings', error: error.message });
  }
});

// メール送信エンドポイント
app.post('/send-email', authenticate, async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    await transporter.sendMail({
      from: smtpSettings.user,
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

// データ保存エンドポイント
app.post('/save-data', authenticate, async (req, res) => {
  try {
    const data = req.body;
    await fs.writeFile(dataFilePath, JSON.stringify(data));
    res.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Failed to save data', error: error.message });
  }
});

// データ取得エンドポイント
app.get('/get-data', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      // ファイルが存在しない場合は空のオブジェクトを返す
      res.json({});
    } else {
      console.error('Error reading data:', error);
      res.status(500).json({ message: 'Failed to read data', error: error.message });
    }
  }
});

module.exports.handler = serverless(app);