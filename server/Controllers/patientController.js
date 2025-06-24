import Patient from '../models/Users/Patient.js';
import HealthRecord from '../models/HealthRecord/HealthRecord.js';
import { uploadToCloudinary } from '../services/uploadService.js';

export const createPatientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const patientData = req.body;
    console.log('Patient Data:', patientData);
    // Handle profile picture upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      patientData.profilePicture = result.url;
    }

    const patient = new Patient({
      userId,
      ...patientData
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updates = req.body;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      updates.profilePicture = result.url;
    }

    const patient = await Patient.findOneAndUpdate(
      { userId },
      updates,
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPatientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const patient = await Patient.findOne({ userId })
      .populate('healthRecords')
      .populate('appointments');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadHealthRecord = async (req, res) => {
  try {
    const { userId } = req.user;
    const { recordType, title, date, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const result = await uploadToCloudinary(req.file.path);

    const healthRecord = new HealthRecord({
      patientId: patient._id,
      recordType,
      title,
      date: date || Date.now(),
      description,
      files: [{
        name: req.file.originalname,
        url: result.url,
        fileType: req.file.mimetype
      }]
    });

    await healthRecord.save();
    
    // Add to patient's health records
    patient.healthRecords.push(healthRecord._id);
    await patient.save();

    res.status(201).json(healthRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};