import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  googleMapsLink: { type: String },
  gstNumber: {
  type: String,
  match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  uppercase: true, // Ensures stored value is in uppercase
  trim: true,
},
manualReview: { type: Boolean, default: false },
gstName:{type:String},
isVerified:{type:Boolean,default:false},
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
  googleMapsPhone: { type: String }, // Phone from Google Maps
  isVerified: { type: Boolean, default: false },
  verificationAttempts: { type: Number, default: 0 },
  lastVerificationAttempt: { type: Date },
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