const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const listRoutes = require('./src/routes/lists');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const categoryRoutes = require('./src/routes/categories');
const storeRoutes = require('./src/routes/stores');
const publicRoutes = require('./src/routes/public');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/public', publicRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Shopping List Backend is running!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
