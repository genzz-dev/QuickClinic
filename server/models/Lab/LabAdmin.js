// models/Users/LabAdmin.js
import mongoose from 'mongoose';

const labAdminSchema = new mongoose.Schema(
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
      sparse: true,
    },

    permissions: {
      manageStaff: { type: Boolean, default: true },
      manageTests: { type: Boolean, default: true },
      manageAppointments: { type: Boolean, default: true },
      manageReports: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('LabAdmin', labAdminSchema);
