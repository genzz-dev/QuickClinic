// models/Report/LabReport.js
import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabAppointment',
      required: true,
    },

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

    // Doctor who should receive this report
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },

    testResults: [
      {
        testName: String,
        testCode: String,
        result: String,
        normalRange: String,
        unit: String,
        isAbnormal: { type: Boolean, default: false },
      },
    ],

    reportFile: {
      url: { type: String, required: true },
      fileName: String,
      uploadedAt: { type: Date, default: Date.now },
    },

    // Doctor's remarks on the report
    doctorRemarks: {
      remarks: String,
      addedAt: Date,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    },

    reportDate: { type: Date, default: Date.now },
    isSharedWithDoctor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('LabReport', labReportSchema);
