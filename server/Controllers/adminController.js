import Admin from '../models/Users/Admin.js';
import Clinic from '../models/Clinic/Clinic.js';
import Doctor from '../models/Users/Doctor.js';
import Schedule from '../models/Clinic/Schedule.js';
import { uploadToCloudinary } from '../services/uploadService.js';
import {sendDoctorAddedToClinicEmail} from '../services/emailService.js';
import { fetchPlacePhone } from '../services/googleMapsService.js';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import mongoose from 'mongoose';
import { 
  extractPlaceIdFromUrl, 
  fetchPlaceDetails, 
  fetchPlacePhotos, 
  parseAddressComponents,
  withRateLimit,
  cleanFormattedAddress
} from '../services/googleMapsService.js';

// Helper validation functions
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\+?[\d\s-()]{7,}$/.test(phone);
// check if admin profile is created or not 
export const checkAdminProfileExists = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const existingAdmin = await Admin.findOne({ userId });

    if (existingAdmin) {
      return res.status(200).json({ 
        exists: true,
        message: 'Admin profile already exists for this user' 
      });
    } else {
      return res.status(200).json({ 
        exists: false,
        message: 'Admin profile does not exist' 
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// check if admin has added a clinic or not
export const checkClinicExists = async (req, res) => {
  try {
    const { userId, clinicId } = req.user;

    if (clinicId) {
      return res.status(200).json({ 
        exists: true,
        message: 'Admin has a clinic',
        clinicId: clinicId
      });
    } else {
      return res.status(200).json({ 
        exists: false,
        message: 'Admin does not have a clinic' 
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Create admin profile
export const createAdminProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const adminData = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const existingAdmin = await Admin.findOne({ userId });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin profile already exists for this user' });
    }

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

// Add new clinic (one per admin)
export const addClinic = async (req, res) => {
  try {
    const { userId, clinicId } = req.user;
    // Check if admin already has a clinic
    if (clinicId) {
      return res.status(400).json({ 
        message: 'Admin can only be associated with one clinic',
        clinicId: clinicId
      });
    }
    if (req.body.contact && typeof req.body.contact === 'string') {
    req.body.contact = JSON.parse(req.body.contact);
  }
    const clinicData = req.body;
    console.log(clinicData);
    console.log(req.body);
    if (!clinicData.name) {
      return res.status(400).json({ 
        message: 'Clinic name is required',
        errors: { name: 'Clinic name is required' }
      });
    }

    const admin = await Admin.findOne({ userId });
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Google Maps integration
    if (clinicData.googleMapsLink) {
      try {
        const placeId = await extractPlaceIdFromUrl(clinicData.googleMapsLink);
        const placeDetails = await withRateLimit(() => fetchPlaceDetails(placeId));
        
        clinicData.address = {
          formattedAddress: cleanFormattedAddress(placeDetails.adr_address) || '',
          ...parseAddressComponents(placeDetails.address_components)
        };
        
        if (placeDetails.geometry?.location) {
          clinicData.address.coordinates = {
            lat: placeDetails.geometry.location.lat,
            lng: placeDetails.geometry.location.lng
          };
        }
        
        const googlePhotos = await withRateLimit(() => fetchPlacePhotos(placeId));
        if (googlePhotos.length > 0) {
          clinicData.photos = googlePhotos;
        }
      } catch (googleError) {
        console.error('Google Maps integration error:', googleError);
      }
    }

    // Handle file uploads
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        clinicData.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload clinic logo' });
      }
    }

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
        if (!clinicData.photos) clinicData.photos = [];
        clinicData.photos.push(...newPhotos);
      } catch (uploadError) {
        console.error('Photos upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new photos' });
      }
    }

    // Create clinic and update admin
    const clinic = new Clinic(clinicData);
    await clinic.save();

    await Admin.findOneAndUpdate(
      { userId },
      { clinicId: clinic._id },
      { new: true }
    );

    res.status(201).json({
      message: 'Clinic added successfully',
      clinic: clinic.toObject({ getters: true, versionKey: false })
    });
        res.status(201).json({
      message: 'Clinic added successfully',
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
const unflatten = (data) => {
  if (Object.prototype.toString.call(data) !== '[object Object]') {
    return data;
  }
  const result = {};
  for (const i in data) {
    const keys = i.split('.');
    keys.reduce((r, e, j) => {
      return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 === j ? data[i] : {}) : []);
    }, result);
  }
  return result;
};


export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.user;
    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    const updates = req.body;
    
    if (Object.keys(updates).length === 0 && !req.files?.logo && !req.files?.photos) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const existingClinic = await Clinic.findById(clinicId);
    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    
    // We will build the final update object with only a $set operator for most fields.
    const updateObj = { $set: {} };

    // Unflatten the updates to handle nested objects and arrays correctly.
    const unflattenedUpdates = unflatten(updates);

    // This will hold the final, combined list of photo URLs.
    // Start with the photos sent from the form (which handles deletions/reordering).
    let finalPhotoArray = [];
    if (unflattenedUpdates.photos) {
        finalPhotoArray = Array.isArray(unflattenedUpdates.photos) 
            ? unflattenedUpdates.photos 
            : [unflattenedUpdates.photos];
        finalPhotoArray = finalPhotoArray.filter(p => p); // Clean up any null/empty values
    } else {
        // If no photos array is sent, start with the existing photos from the DB.
        finalPhotoArray = existingClinic.photos || [];
    }
    
    // Process all non-file fields from the form.
    for (const key in unflattenedUpdates) {
      // We are handling 'photos' separately, so we skip it here.
      if (key === 'photos') continue;

      if (key === 'facilities') {
          const facilities = Array.isArray(unflattenedUpdates.facilities) ? unflattenedUpdates.facilities : [unflattenedUpdates.facilities];
          updateObj.$set.facilities = facilities.filter(f => f); // Filter out empty values
      } else {
        // This correctly sets all other fields, including nested ones like 'openingHours.monday.open'
        updateObj.$set[key] = unflattenedUpdates[key];
      }
    }

    // Handle logo upload.
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        updateObj.$set.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new logo' });
      }
    }

    // Handle NEW photo uploads.
    if (req.files?.photos) {
      try {
        const newPhotoUrls = await Promise.all(
          req.files.photos.map(async (file) => {
            const result = await uploadToCloudinary(file.path);
            return result.url; // The schema expects an array of strings.
          })
        );
        // Add the newly uploaded photo URLs to our final array.
        finalPhotoArray.push(...newPhotoUrls);
      } catch (uploadError) {
        console.error('Photos upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new photos' });
      }
    }
     
    // Now, set the 'photos' field with the final, combined array using a single $set operation.
    // This avoids the conflict entirely.
    updateObj.$set.photos = finalPhotoArray;

    // Final validation.
    if (updateObj.$set.name !== undefined && updateObj.$set.name?.trim() === '') {
        return res.status(400).json({ message: 'Validation error', errors: ['Clinic name cannot be empty'] });
    }
    
    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      updateObj,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      message: 'Clinic updated successfully',
      clinic: updatedClinic.toObject({ getters: true })
    });

  } catch (error) {
    console.error('Error updating clinic:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    // Catch the specific conflict error just in case, though the logic should prevent it.
    if (error.codeName === 'ConflictingUpdateOperators') {
      return res.status(400).json({ message: `A conflict occurred while trying to update fields. Details: ${error.errmsg}`});
    }
    res.status(500).json({
      message: 'Failed to update clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add doctor to clinic
export const addDoctorToClinic = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { doctorId } = req.body;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }



    const clinicExists = await Clinic.exists({ _id: clinicId });
    if (!clinicExists) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorInClinic = await Clinic.findOne({ 
      _id: clinicId, 
      doctors: { $in: [doctorId] } 
    });
    if (doctorInClinic) {
      return res.status(409).json({ message: 'Doctor is already associated with this clinic' });
    }

    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $addToSet: { doctors: doctorId } },
      { new: true }
    ).select('-__v');

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

// Set doctor schedule
export const setDoctorSchedule = async (req, res) => {
  try {
        const { clinicId } = req.user;
    const { doctorId } = req.params;
    const { workingDays, breaks, vacations, appointmentDuration } = req.body;
    console.log(req.body);
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
            // Check if doctor exists in this clinic
    const doctorInClinic = await Clinic.findOne({ 
      _id: clinicId, 
      doctors: { $in: [doctorId] } 
    });

    if (!doctorInClinic) {
      return res.status(403).json({ 
        message: 'Doctor is not associated with your clinic' 
      });
    }
    // Validate working days
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

    // Validate breaks
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

    // Validate vacations
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

    const schedule = await Schedule.findOneAndUpdate(
      { doctorId },
      {
        workingDays: workingDays || [],
        breaks: breaks || [],
        vacations: vacations || [],
        appointmentDuration: appointmentDuration || 30
      },
      { new: true, upsert: true, runValidators: true }
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
    const { clinicId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    // Check if doctor exists in this clinic
    const doctorInClinic = await Clinic.findOne({ 
      _id: clinicId, 
      doctors: { $in: [doctorId] } 
    });

    if (!doctorInClinic) {
      return res.status(403).json({ 
        message: 'Doctor is not associated with your clinic' 
      });
    }

    const schedule = await Schedule.findOne({ doctorId })
      .populate('doctorId');


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
//get all doctor for clinic 
export const getClinicDoctors = async (req, res) => {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    const clinic = await Clinic.findById(clinicId)
      .populate('doctors');
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json({
      message: 'Doctors retrieved successfully',
      doctors: clinic.doctors
    });
  } catch (error) {
    console.error('Error fetching clinic doctors:', error);
    res.status(500).json({ 
      message: 'Failed to fetch clinic doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove doctor from clinic
export const removeDoctorFromClinic = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { doctorId } = req.params;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    // Check if doctor exists in this clinic
    const clinic = await Clinic.findOne({ 
      _id: clinicId, 
      doctors: { $in: [doctorId] } 
    });

    if (!clinic) {
      return res.status(404).json({ 
        message: 'Doctor not found in this clinic' 
      });
    }

    // Remove doctor from clinic
    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $pull: { doctors: doctorId } },
      { new: true }
    );

    // Remove clinic reference from doctor
    await Doctor.findByIdAndUpdate(
      doctorId,
      { $unset: { clinicId: 1 } },
      { new: true }
    );

    res.json({
      message: 'Doctor removed from clinic successfully',
      clinic: updatedClinic
    });
  } catch (error) {
    console.error('Error removing doctor from clinic:', error);
    res.status(500).json({ 
      message: 'Failed to remove doctor from clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Get clinic information (for admin's own clinic)
export const getClinicInfo = async (req, res) => {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    const clinic = await Clinic.findById(clinicId)
      .populate({
        path: 'doctors',
        select: 'firstName lastName specialization profilePicture',
        options: { lean: true }
      })
      .populate({
        path: 'admins',
        select: 'firstName lastName',
        options: { lean: true }
      })
      .lean();

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    // Just add fullName to doctors and admins, keep everything else as is
    const enhancedClinic = {
      ...clinic, // Spread all clinic properties
      doctors: clinic.doctors.map(doctor => ({
        ...doctor,
        fullName: `${doctor.firstName} ${doctor.lastName}`
      })),
      admins: clinic.admins.map(admin => ({
        ...admin,
        fullName: `${admin.firstName} ${admin.lastName}`
      }))
    };

    res.json({
      message: 'Clinic information retrieved successfully',
      clinic: enhancedClinic
    });
  } catch (error) {
    console.error('Error fetching clinic information:', error);
    res.status(500).json({ 
      message: 'Failed to fetch clinic information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send verification OTP
export const sendVerificationOTP = async (req, res) => {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    if (clinic.isVerified) {
      return res.status(400).json({ message: 'Clinic is already verified' });
    }

    // Check permanent max attempts (3 total, forever)
    if (clinic.verificationAttempts >= 3) {
      return res.status(429).json({
        message: 'Maximum verification attempts reached. Verification is no longer possible.'
      });
    }

    // Get phone from Google Maps if not already fetched
    let phoneNumber = clinic.googleMapsPhone;
    if (!phoneNumber && clinic.googleMapsLink) {
      try {
        const placeId = await extractPlaceIdFromUrl(clinic.googleMapsLink);
        const phoneData = await withRateLimit(() => fetchPlacePhone(placeId));
        phoneNumber = phoneData.internationalPhone || phoneData.formattedPhone;

        if (phoneNumber) {
          await Clinic.findByIdAndUpdate(clinicId, {
            googleMapsPhone: phoneNumber
          });
        }
      } catch (error) {
        console.error('Error fetching phone from Google Maps:', error);
      }
    }

    if (!phoneNumber) {
      return res.status(400).json({
        message:
          'No phone number found for this clinic. Please add a Google Maps link with phone number.'
      });
    }

    // Increment attempt BEFORE sending OTP (so failures still count)
    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        $inc: { verificationAttempts: 1 },
        $set: { lastVerificationAttempt: new Date() }
      },
      { new: true }
    );

    // Send OTP
    const otpResult = await sendOTP(phoneNumber);
    console.log('OTP sent result:', otpResult);

    if (!otpResult.success) {
      return res.status(500).json({
        message: otpResult.message,
        attemptsLeft: Math.max(0, 3 - updatedClinic.verificationAttempts)
      });
    }

    res.json({
      message: 'OTP sent successfully',
      phone: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      attemptsLeft: Math.max(0, 3 - updatedClinic.verificationAttempts)
    });
  } catch (error) {
    console.error('Error sending verification OTP:', error);
    res.status(500).json({
      message: 'Failed to send verification OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Verify OTP and mark clinic as verified
export const verifyClinicOTP = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { code } = req.body;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    if (!code) {
      return res.status(400).json({ message: 'OTP code is required' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    if (clinic.isVerified) {
      return res.status(400).json({ message: 'Clinic is already verified' });
    }

    if (!clinic.googleMapsPhone) {
      return res.status(400).json({ message: 'No phone number found for verification' });
    }

    // Verify OTP
    const verificationResult = await verifyOTP(clinic.googleMapsPhone, code);
    
    if (!verificationResult.success) {
      return res.status(400).json({ message: verificationResult.message });
    }

    // Mark clinic as verified
    await Clinic.findByIdAndUpdate(clinicId, {
      isVerified: true,
      verificationAttempts: 0
    });

    res.json({
      message: 'Clinic verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying clinic OTP:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
