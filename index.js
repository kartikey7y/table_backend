const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://deffinder:pyB10mCQbpgGz4Qv@cluster0.ewpqtiz.mongodb.net/table?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookingSchema = new mongoose.Schema({
  date: String,
  time: String,
  guests: Number,
  name: String,
  contact: String,
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
// Check availability
app.get('/api/availability', async (req, res) => {
  const { date, time } = req.query;
  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  
  const providedDate = new Date(date);
  if (providedDate <= new Date()) {
    return res.status(200).json({ message: "Past dates are not allowed." });
  }

  const existingBooking = await Booking.findOne({ date });
  const slotsAvailable = !existingBooking;

  res.json({ slots: slotsAvailable ? ['Available'] : [] });
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  const { date, time, guests, name, contact } = req.body;

  if (!date || !time || !guests || !name || !contact) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const providedDate = new Date(date);
  if (providedDate <= new Date()) {
    return res.status(200).json({ past: "Past dates are not allowed." });
  }

  const existingBooking = await Booking.findOne({ date });
  if (existingBooking) {
    return res.json({message : 'Slot is already booked'});
  }

  const newBooking = new Booking({ date, time, guests, name, contact });
  await newBooking.save();

  res.status(201).json(newBooking);
});

// Delete a booking
app.delete('/api/bookings', async (req, res) => {
  const { date, time } = req.body;

  const booking = await Booking.findOneAndDelete({ date, time });
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.status(200).json({ message: 'Booking deleted successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
