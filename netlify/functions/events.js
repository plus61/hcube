const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const dataFilePath = path.join(__dirname, 'data.json');

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

async function readEvents() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.events || [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeEvents(events) {
  let existing = {};
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    existing = JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  existing.events = events;
  await fs.writeFile(dataFilePath, JSON.stringify(existing, null, 2));
}

// GET / - イベント一覧取得（sortOrder昇順）
// Netlify redirect: /api/events → /.netlify/functions/events → Express sees "/"
app.get('/', async (req, res) => {
  try {
    const events = await readEvents();
    events.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    res.json(events);
  } catch (error) {
    console.error('Error reading events:', error);
    res.status(500).json({ message: 'Failed to read events', error: error.message });
  }
});

// POST / - イベント追加
app.post('/', authenticate, async (req, res) => {
  try {
    const newEvent = req.body;
    const events = await readEvents();
    if (newEvent.sortOrder == null) {
      const maxOrder = events.length > 0
        ? Math.max(...events.map(e => e.sortOrder ?? 0))
        : 0;
      newEvent.sortOrder = maxOrder + 1;
    }
    events.push(newEvent);
    await writeEvents(events);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Failed to add event', error: error.message });
  }
});

// PUT /:id - イベント更新
// Netlify redirect: /api/events/123 → /.netlify/functions/events/123 → Express sees "/123"
app.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = req.body;
    let events = await readEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    events[index] = updatedEvent;
    await writeEvents(events);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// DELETE /:id - イベント削除
app.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    let events = await readEvents();
    events = events.filter(e => e.id !== id);
    await writeEvents(events);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

module.exports.handler = serverless(app);
