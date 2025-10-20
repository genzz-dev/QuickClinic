import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      instructions: { type: String },
    },
  ],
  tests: [
    {
      name: { type: String },
      instructions: { type: String },
    },
  ],
  notes: { type: String },
  followUpDate: { type: Date },
  isDigitalSignature: { type: Boolean, default: false },
  signature: { type: String },
});

export default mongoose.model('Prescription', prescriptionSchema);
