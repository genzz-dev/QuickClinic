// models/Appointment/LabAppointment.js
import mongoose from 'mongoose';

const labAppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },

    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true,
    },

    // Doctor who suggested this lab (optional)
    suggestedByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },

    tests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId },
        testName: { type: String, required: true },
        testCode: String,
        category: String,
        price: { type: Number, required: true },
        homeCollectionAvailable: { type: Boolean, required: true },
        requiresEquipment: { type: Boolean, default: false },
      },
    ],

    collectionType: {
      type: String,
      enum: ['home_collection', 'visit_lab'],
      required: true,
    },

    // Validation: Check if all tests support home collection
    canBeHomeCollected: {
      type: Boolean,
      required: true,
    },

    // For home collection
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabStaff',
    },

    collectionAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },

    // Report details
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabReport',
    },

    totalAmount: { type: Number, required: true },
    homeCollectionFee: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('LabAppointment', labAppointmentSchema);
