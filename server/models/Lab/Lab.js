// models/Lab/Lab.js
import mongoose from 'mongoose';

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: {
      formattedAddress: String,
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
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
      website: String,
    },
    logo: { type: String },
    photos: [String],

    tests: [
      {
        testName: { type: String, required: true },
        testCode: String,
        category: {
          type: String,
          enum: [
            'blood_test',
            'urine_test',
            'stool_test',
            'saliva_test',
            'swab_test',
            'imaging', // X-Ray, CT, MRI, Ultrasound
            'endoscopy',
            'biopsy',
            'ecg',
            'pulmonary_function',
            'other',
          ],
          required: true,
        },
        description: String,
        price: { type: Number, required: true },
        preparationInstructions: String,
        sampleType: {
          type: String,
          enum: ['blood', 'urine', 'stool', 'saliva', 'swab', 'tissue', 'none', 'other'],
        },

        // Key field: whether this specific test supports home collection
        homeCollectionAvailable: {
          type: Boolean,
          default: false,
        },

        // Additional fee for home collection of this specific test (if different from general lab fee)
        homeCollectionFee: {
          type: Number,
          default: 0,
        },

        reportDeliveryTime: String, // e.g., "24 hours", "2-3 days"

        // For imaging tests - special requirements
        requiresEquipment: {
          type: Boolean,
          default: false,
        },
        equipmentName: String, // e.g., "X-Ray Machine", "CT Scanner"

        isActive: { type: Boolean, default: true },
      },
    ],

    // Lab staff members
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabStaff' }],

    // Lab admin who manages this lab
    labAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabAdmin',
      required: true,
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    openingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean },
    },

    // General lab settings for home collection
    generalHomeCollectionFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Lab', labSchema);
