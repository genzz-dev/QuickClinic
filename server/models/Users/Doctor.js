// models/User/Doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialization: { type: String, required: true },
  qualifications: [String],
  yearsOfExperience: { type: Number },
  bio: { type: String },
  phoneNumber: { type: String },
  profilePicture: { type: String },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  consultationFee: { type: Number, required: true },
  availableForTeleconsultation: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationData: {
    registrationNumber: { type: String },
    registrationYear: { type: String },
    stateCouncil: { type: String },
    verifiedName: { type: String },
    verificationDate: { type: Date },
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
  },
});

export default mongoose.model('Doctor', doctorSchema);
