// models/Lab/LabStaff.js
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

    // Lab association (initially null until admin adds them)
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      default: null,
    },

    role: {
      type: String,
      enum: ['technician', 'phlebotomist', 'assistant', 'sample_collector'],
      default: 'assistant',
    },

    // Profile completion status
    isProfileComplete: { type: Boolean, default: false },

    // Whether staff is associated with a lab
    isAssignedToLab: { type: Boolean, default: false },

    // For home sample collection assignments
    isAvailableForHomeCollection: { type: Boolean, default: true },

    currentAssignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabAppointment',
      },
    ],

    completedAssignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabAppointment',
      },
    ],

    // Professional details
    qualifications: [String],
    experience: { type: Number }, // years
    profilePicture: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('LabStaff', labStaffSchema);
