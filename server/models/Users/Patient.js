// models/User/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phoneNumber: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  profilePicture: { type: String },
  healthRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
});

export default mongoose.model('Patient', patientSchema);