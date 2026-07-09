const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'owner', 'factory'],
    default: 'customer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (err) {
    throw new Error(err);
  }
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;