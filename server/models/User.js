import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String }
}, { timestamps: true });

// Change the export line to this:
export const User = mongoose.model('User', userSchema);