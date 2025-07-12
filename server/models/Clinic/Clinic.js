import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  googleMapsLink: { type: String },
  address: {
    formattedAddress: { type: String, required: true },
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
    monday: { open: { type: String, required: true }, close: { type: String, required: true } },
    tuesday: { open: { type: String, required: true }, close: { type: String, required: true } },
    wednesday: { open: { type: String, required: true }, close: { type: String, required: true } },
    thursday: { open: { type: String, required: true }, close: { type: String, required: true } },
    friday: { open: { type: String, required: true }, close: { type: String, required: true } },
    saturday: { open: { type: String, required: true }, close: { type: String, required: true } },
    sunday: { open: { type: String, required: true }, close: { type: String, required: true } }
  },
  logo: { type: String },
  photos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Clinic', clinicSchema);