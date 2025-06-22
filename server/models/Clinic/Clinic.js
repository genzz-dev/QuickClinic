import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  facilities: [String],
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  logo: { type: String },
  photos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Clinic', clinicSchema);