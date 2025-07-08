import Admin from '../models/Users/Admin.js';
import Clinic from '../models/Clinic/Clinic.js';
import Doctor from '../models/Users/Doctor.js';
import { uploadToCloudinary } from '../services/uploadService.js';
import {sendDoctorAddedToClinicEmail} from '../services/emailService.js';
import mongoose from 'mongoose';

// Create admin profile
export const createAdminProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const adminData = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if admin profile already exists
    const existingAdmin = await Admin.findOne({ userId });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin profile already exists for this user' });
    }

    // Basic validation
    if (!adminData || Object.keys(adminData).length === 0) {
      return res.status(400).json({ message: 'Admin data is required' });
    }

    const admin = new Admin({
      userId,
      ...adminData
    });

    await admin.save();
    
    res.status(201).json({
      message: 'Admin profile created successfully',
      admin: admin.toObject({ getters: true, versionKey: false })
    });
  } catch (error) {
    console.error('Error creating admin profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to create admin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add new clinic
export const addClinic = async (req, res) => {
  try {
    const { userId } = req.user;
    const clinicData = req.body;
    // Validate required clinic fields
    if (!clinicData.name || !clinicData.address) {
      return res.status(400).json({ 
        message: 'Required fields missing',
        errors: {
          name: !clinicData.name ? 'Clinic name is required' : undefined,
          address: !clinicData.address ? 'Address is required' : undefined
        }
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ userId });
    console.log(admin);
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Handle logo upload
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        clinicData.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload clinic logo' });
      }
    }

    // Handle clinic photos upload
    if (req.files?.photos) {
      try {
        clinicData.photos = await Promise.all(
          req.files.photos.map(async (file) => {
            const result = await uploadToCloudinary(file.path);
            return {
              url: result.url,
              uploadedAt: new Date(),
              originalName: file.originalname
            };
          })
        );
      } catch (uploadError) {
        console.error('Photos upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload clinic photos' });
      }
    }

    // Create new clinic
    const clinic = new Clinic(clinicData);
    await clinic.save();

    // Update admin's clinic reference
    await Admin.findOneAndUpdate(
      { userId },
      { $addToSet: { clinics: clinic._id } },
      { new: true }
    );

    res.status(201).json({
      message: 'Clinic added successfully',
      clinic: clinic.toObject({ getters: true, versionKey: false })
    });
  } catch (error) {
    console.error('Error adding clinic:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to add clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update clinic information
export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const updates = req.body;

    // Validate clinic ID
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      return res.status(400).json({ message: 'Invalid clinic ID format' });
    }

    if (!updates || Object.keys(updates).length === 0 && !req.files?.logo && !req.files?.photos) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    // Handle logo update
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        updates.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new logo' });
      }
    }

    // Handle additional photos
    if (req.files?.photos) {
      try {
        const newPhotos = await Promise.all(
          req.files.photos.map(async (file) => {
            const result = await uploadToCloudinary(file.path);
            return {
              url: result.url,
              uploadedAt: new Date(),
              originalName: file.originalname
            };
          })
        );
        updates.$push = { photos: { $each: newPhotos } };
      } catch (uploadError) {
        console.error('Photos upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new photos' });
      }
    }

    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json({
      message: 'Clinic updated successfully',
      clinic: clinic.toObject({ getters: true })
    });
  } catch (error) {
    console.error('Error updating clinic:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to update clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add doctor to clinic
export const addDoctorToClinic = async (req, res) => {
  try {
    const { clinicId, doctorId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(clinicId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        errors: {
          clinicId: !mongoose.Types.ObjectId.isValid(clinicId) ? 'Invalid clinic ID' : undefined,
          doctorId: !mongoose.Types.ObjectId.isValid(doctorId) ? 'Invalid doctor ID' : undefined
        }
      });
    }

    // Check if clinic exists
    const clinicExists = await Clinic.exists({ _id: clinicId });
    if (!clinicExists) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor is already in this clinic
    const doctorInClinic = await Clinic.findOne({ 
      _id: clinicId, 
      doctors: { $in: [doctorId] } 
    });
    if (doctorInClinic) {
      return res.status(409).json({ message: 'Doctor is already associated with this clinic' });
    }

    // Add doctor to clinic
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $addToSet: { doctors: doctorId } },
      { new: true }
    ).select('-__v');

    // Add clinic to doctor
    await Doctor.findByIdAndUpdate(
      doctorId, 
      { clinicId },
      { runValidators: true }
    );
   
    res.json({
      message: 'Doctor added to clinic successfully',
      clinic: clinic.toObject({ getters: true })
    });
  } catch (error) {
    console.error('Error adding doctor to clinic:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to add doctor to clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const setDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { workingDays, breaks, vacations, appointmentDuration } = req.body;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Validate working days structure if provided
    if (workingDays) {
      const dayErrors = [];
      workingDays.forEach(day => {
        if (!day.day || !['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day.day)) {
          dayErrors.push(`Invalid day: ${day.day}`);
        }
        if (day.isWorking && (!day.startTime || !day.endTime)) {
          dayErrors.push(`Working day ${day.day} must have start and end times`);
        }
      });

      if (dayErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Working days validation failed',
          errors: dayErrors
        });
      }
    }

    // Validate breaks if provided
    if (breaks) {
      const breakErrors = [];
      breaks.forEach(brk => {
        if (!brk.day || !brk.startTime || !brk.endTime) {
          breakErrors.push('Break must have day, start time and end time');
        }
      });

      if (breakErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Breaks validation failed',
          errors: breakErrors
        });
      }
    }

    // Validate vacations if provided
    if (vacations) {
      const vacationErrors = [];
      vacations.forEach(vacation => {
        if (!vacation.startDate || !vacation.endDate) {
          vacationErrors.push('Vacation must have start and end dates');
        }
        if (new Date(vacation.startDate) > new Date(vacation.endDate)) {
          vacationErrors.push('Vacation start date must be before end date');
        }
      });

      if (vacationErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Vacations validation failed',
          errors: vacationErrors
        });
      }
    }

    // Validate appointment duration
    if (appointmentDuration && (isNaN(appointmentDuration) || appointmentDuration <= 0)) {
      return res.status(400).json({ message: 'Appointment duration must be a positive number' });
    }

    // Update or create schedule
    const schedule = await Schedule.findOneAndUpdate(
      { doctorId },
      {
        workingDays: workingDays || [],
        breaks: breaks || [],
        vacations: vacations || [],
        appointmentDuration: appointmentDuration || 30
      },
      { 
        new: true,
        upsert: true,
        runValidators: true 
      }
    );

    res.json({
      message: 'Doctor schedule updated successfully',
      schedule: schedule.toObject({ getters: true })
    });

  } catch (error) {
    console.error('Error setting doctor schedule:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to set doctor schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get doctor schedule
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    const schedule = await Schedule.findOne({ doctorId })
      .populate('doctorId', 'name specialization')
      .lean();

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found for this doctor' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ 
      message: 'Failed to fetch doctor schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};