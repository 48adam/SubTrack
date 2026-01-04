const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Import routes
const subscriptionRoutes = require('./routes/subscription.routes');
const authRoutes = require('./routes/auth.routes');

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Backend works!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handling middleware (DEBE SER AL FINAL)
app.use((err, req, res, next) => {
  console.error('ERROR CAUGHT:', err);
  res.status(500).json({ error: err.message || 'Unknown error' });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Server works on port ${PORT}`);
});