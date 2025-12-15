import LabReport from '../../models/Lab/LabReport.js';
import LabAppointment from '../../models/Lab/LabAppointment.js';
import { uploadToCloudinary } from '../../services/uploadService.js';

// Upload lab report (by lab admin/staff)
export const uploadLabReport = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { testResults } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Report file is required' });
    }

    const appointment = await LabAppointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Upload report file
    const uploadResult = await uploadToCloudinary(req.file.path);

    const report = new LabReport({
      appointmentId,
      patientId: appointment.patientId,
      labId: appointment.labId,
      doctorId: appointment.suggestedByDoctorId || undefined,
      testResults: testResults ? JSON.parse(testResults) : [],
      reportFile: {
        url: uploadResult.url,
        fileName: req.file.originalname,
      },
      isSharedWithDoctor: !!appointment.suggestedByDoctorId,
    });

    await report.save();

    // Update appointment
    appointment.reportId = report._id;
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({
      message: 'Lab report uploaded successfully',
      report: report.toObject({ getters: true }),
    });
  } catch (error) {
    console.error('Error uploading lab report:', error);
    res.status(500).json({ message: 'Failed to upload report' });
  }
};

// Get patient's lab reports
export const getPatientLabReports = async (req, res) => {
  try {
    const { profileId } = req.user;

    const reports = await LabReport.find({ patientId: profileId })
      .populate('labId', 'name address')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId', 'tests appointmentDate')
      .sort({ reportDate: -1 })
      .lean();

    res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// Get doctor's patient lab reports (reports shared with doctor)
export const getDoctorPatientReports = async (req, res) => {
  try {
    const { profileId } = req.user;

    const reports = await LabReport.find({
      doctorId: profileId,
      isSharedWithDoctor: true,
    })
      .populate('patientId', 'firstName lastName dateOfBirth gender')
      .populate('labId', 'name')
      .populate('appointmentId', 'tests appointmentDate')
      .sort({ reportDate: -1 })
      .lean();

    res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error('Error fetching doctor reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// Add doctor remarks to report
export const addDoctorRemarks = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { profileId } = req.user;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ message: 'Remarks are required' });
    }

    const report = await LabReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.doctorId && report.doctorId.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to add remarks to this report' });
    }

    report.doctorRemarks = {
      remarks,
      addedAt: new Date(),
      addedBy: profileId,
    };

    await report.save();

    res.json({
      message: 'Remarks added successfully',
      report,
    });
  } catch (error) {
    console.error('Error adding remarks:', error);
    res.status(500).json({ message: 'Failed to add remarks' });
  }
};

// Get specific report details
export const getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { profileId, role } = req.user;

    const report = await LabReport.findById(reportId)
      .populate('patientId', 'firstName lastName dateOfBirth gender')
      .populate('labId', 'name address contact')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId')
      .lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check
    if (role === 'patient' && report.patientId._id.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (
      role === 'doctor' &&
      (!report.doctorId || report.doctorId._id.toString() !== profileId.toString())
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
};
