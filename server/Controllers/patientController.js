import Patient from '../models/Users/Patient.js';
import HealthRecord from '../models/HealthRecord/HealthRecord.js';
import { uploadToCloudinary } from '../services/uploadService.js';
import mongoose from 'mongoose';

export const createPatientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ message: 'Patient profile already exists' });
    }

    const patientData = req.body;
    
    // Basic validation
    if (!patientData || Object.keys(patientData).length === 0) {
      return res.status(400).json({ message: 'Patient data is required' });
    }

    // Handle profile picture upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        patientData.profilePicture = result.url;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    const patient = new Patient({
      userId,
      ...patientData
    });

    await patient.save();
    res.status(201).json({
      message: 'Patient profile created successfully',
      patient: patient.toObject({ getters: true })
    });
  } catch (error) {
    console.error('Error creating patient profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to create patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const { profileId } = req.user;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    // Handle profile picture upload if file exists
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        updates.profilePicture = result.url;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      profileId,
      updates,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({
      message: 'Patient profile updated successfully',
      patient: patient.toObject({ getters: true })
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to update patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPatientProfile = async (req, res) => {
  try {
    const { profileId } = req.user;
    
    // First check if patient exists without populating
    const patientExists = await Patient.exists({ _id: profileId });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Only populate fields that have data
    const patient = await Patient.findById(profileId).lean();
    
    const populateOptions = [];
    
    if (patient.healthRecords && patient.healthRecords.length > 0) {
      populateOptions.push({ path: 'healthRecords', select: '-__v' });
    }
    
    if (patient.appointments && patient.appointments.length > 0) {
      populateOptions.push({ 
        path: 'appointments',
        select: '-__v',
        populate: {
          path: 'doctorId',
          select: 'name specialization'
        }
      });
    }
    
    let populatedPatient = patient;
    if (populateOptions.length > 0) {
      populatedPatient = await Patient.findById(profileId)
        .populate(populateOptions)
        .lean();
    }

    // Remove sensitive or unnecessary fields
    delete populatedPatient.__v;
    
    res.json(populatedPatient);
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ 
      message: 'Failed to fetch patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const uploadHealthRecord = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { recordType, title, date, description } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (!recordType || !title) {
      return res.status(400).json({ 
        message: 'Record type and title are required',
        errors: {
          recordType: !recordType ? 'Record type is required' : undefined,
          title: !title ? 'Title is required' : undefined
        }
      });
    }

    // Validate date format if provided
    if (date && isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const patient = await Patient.findById(profileId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(req.file.path);
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload health record file' });
    }

    const healthRecord = new HealthRecord({
      patientId: profileId,
      recordType,
      title,
      date: date ? new Date(date) : new Date(),
      description,
      files: [{
        name: req.file.originalname,
        url: uploadResult.url,
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      }]
    });

    await healthRecord.save();
    
    // Add to patient's health records
    patient.healthRecords.push(healthRecord._id);
    await patient.save();

    res.status(201).json({
      message: 'Health record uploaded successfully',
      record: {
        ...healthRecord.toObject({ getters: true }),
        __v: undefined // Remove version key
      }
    });
  } catch (error) {
    console.error('Error uploading health record:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to upload health record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Check if Patient Profile Exists
 */
export const checkPatientProfileExists = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        hasProfile: false 
      });
    }

    const existingProfile = await Patient.findOne({ userId });
    
    if (existingProfile) {
      return res.status(200).json({
        message: 'Patient profile exists',
        hasProfile: true,
        profileId: existingProfile._id
      });
    } else {
      return res.status(200).json({
        message: 'Patient profile does not exist',
        hasProfile: false
      });
    }

  } catch (error) {
    console.error('Error checking patient profile:', error);
    res.status(500).json({
      message: 'Failed to check patient profile',
      hasProfile: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

