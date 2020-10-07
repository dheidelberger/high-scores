const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'A user name is required'],
  },
  score: {
    type: Number,
    required: [true, 'You must enter a score'],
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', scoreSchema);
