// models/User/Admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    unique: true,
    sparse: true,
  },
  permissions: {
    manageDoctors: { type: Boolean, default: true },
    manageAppointments: { type: Boolean, default: true },
    managePatients: { type: Boolean, default: true },
    manageClinicInfo: { type: Boolean, default: true },
  },
});

export default mongoose.model('Admin', adminSchema);
