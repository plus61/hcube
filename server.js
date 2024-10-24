import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const dataFile = path.join(__dirname, 'data', 'events.json');

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

app.get('/api/events', async (req, res) => {
  try {
    const data = await fs.readFile(dataFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading events:', error);
    res.status(500).json({ error: 'Error reading events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const newEvent = req.body;
    const data = await fs.readFile(dataFile, 'utf8');
    const events = JSON.parse(data);
    events.push(newEvent);
    await fs.writeFile(dataFile, JSON.stringify(events, null, 2));
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Error adding event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = req.body;
    const data = await fs.readFile(dataFile, 'utf8');
    let events = JSON.parse(data);
    events = events.map(event => event.id === id ? updatedEvent : event);
    await fs.writeFile(dataFile, JSON.stringify(events, null, 2));
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(dataFile, 'utf8');
    let events = JSON.parse(data);
    events = events.filter(event => event.id !== id);
    await fs.writeFile(dataFile, JSON.stringify(events, null, 2));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
