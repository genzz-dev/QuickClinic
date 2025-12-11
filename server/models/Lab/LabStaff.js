// models/Users/LabStaff.js
import mongoose from 'mongoose';

const labStaffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true,
    },

    role: {
      type: String,
      enum: ['technician', 'phlebotomist', 'assistant', 'sample_collector'],
      default: 'assistant',
    },

    // For home sample collection assignments
    isAvailableForHomeCollection: { type: Boolean, default: true },
    currentAssignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabAppointment',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('LabStaff', labStaffSchema);
