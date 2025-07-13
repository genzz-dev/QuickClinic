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
  monday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  tuesday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  wednesday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  thursday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  friday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  saturday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  },
  sunday: {
    isClosed: { type: Boolean, default: false },
    open: { type: String },
    close: { type: String }
  }
}
,
  logo: { type: String },
  photos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Clinic', clinicSchema);