import Admin from '../models/Users/Admin.js';
import Clinic from '../models/Clinic/Clinic.js'
import Doctor from '../models/Users/Doctor.js';
import { uploadToCloudinary } from '../services/uploadService.js';

export const createAdminProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const adminData = req.body;

    const admin = new Admin({
      userId,
      ...adminData
    });

    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addClinic = async (req, res) => {
  try {
    const { userId } = req.user;
    const clinicData = req.body;

    // Handle logo upload
    if (req.files?.logo) {
      const result = await uploadToCloudinary(req.files.logo[0].path);
      clinicData.logo = result.url;
    }

    // Handle clinic photos upload
    if (req.files?.photos) {
      clinicData.photos = await Promise.all(
        req.files.photos.map(async (file) => {
          const result = await uploadToCloudinary(file.path);
          return result.url;
        })
      );
    }

    const clinic = new Clinic(clinicData);
    await clinic.save();

    // Add clinic to admin's clinic
    const admin = await Admin.findOneAndUpdate(
      { userId },
      { clinicId: clinic._id },
      { new: true }
    );

    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const updates = req.body;

    // Handle logo update
    if (req.files?.logo) {
      const result = await uploadToCloudinary(req.files.logo[0].path);
      updates.logo = result.url;
    }

    // Handle additional photos
    if (req.files?.photos) {
      const newPhotos = await Promise.all(
        req.files.photos.map(async (file) => {
          const result = await uploadToCloudinary(file.path);
          return result.url;
        })
      );
      updates.$push = { photos: { $each: newPhotos } };
    }

    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      updates,
      { new: true }
    );

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addDoctorToClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { doctorId } = req.body;

    // Add doctor to clinic
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $addToSet: { doctors: doctorId } },
      { new: true }
    );

    // Add clinic to doctor
    await Doctor.findByIdAndUpdate(doctorId, { clinicId });

    res.json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};