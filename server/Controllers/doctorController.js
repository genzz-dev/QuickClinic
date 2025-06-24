import Doctor from '../models/Users/Doctor.js';
import { uploadToCloudinary } from '../services/uploadService.js';
//Create a doctor profile
export const createDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const doctorData = req.body;

    // Handle profile picture upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      doctorData.profilePicture = result.url;
    }

    // Create doctor profile linked to user
    const doctor = new Doctor({
      userId,
      ...doctorData
    });

    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//Update a doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updates = req.body;

    // Handle profile picture update
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      updates.profilePicture = result.url;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId },
      updates,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Get doctor profile
export const getDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const doctor = await Doctor.findOne({ userId })
      .populate('clinicId', 'name address')
      .populate('appointments');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all doctors by clinic
export const getDoctorsByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const doctors = await Doctor.find({ clinicId })
      .select('-appointments -ratings')
      .populate('clinicId', 'name');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};