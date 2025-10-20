import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  recordType: {
    type: String,
    enum: [
      'allergy',
      'condition',
      'immunization',
      'lab-result',
      'medication',
      'procedure',
      'vital-sign',
    ],
    required: true,
  },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  files: [
    {
      name: { type: String },
      url: { type: String, required: true },
      fileType: { type: String },
    },
  ],
  isShared: { type: Boolean, default: false },
  sharedWith: [
    {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
      dateShared: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model('HealthRecord', healthRecordSchema);
