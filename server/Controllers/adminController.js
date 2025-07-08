import Admin from '../models/Users/Admin.js';
import Clinic from '../models/Clinic/Clinic.js';
import Doctor from '../models/Users/Doctor.js';
import { uploadToCloudinary } from '../services/uploadService.js';
import {sendDoctorAddedToClinicEmail} from '../services/emailService.js';
import mongoose from 'mongoose';
import { 
  extractPlaceIdFromUrl, 
  fetchPlaceDetails, 
  fetchPlacePhotos, 
  parseAddressComponents,
  withRateLimit,
  cleanFormattedAddress
} from '../services/googleMapsService.js';
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
    if (!clinicData.name) {
      return res.status(400).json({ 
        message: 'Clinic name is required',
        errors: { name: 'Clinic name is required' }
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ userId });
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // If Google Maps link is provided, fetch details
if (clinicData.googleMapsLink) {
  try {
    const placeId = await extractPlaceIdFromUrl(clinicData.googleMapsLink);
    const placeDetails = await withRateLimit(() => fetchPlaceDetails(placeId));
    
    // Store the complete formatted address
    clinicData.address = {
      formattedAddress: cleanFormattedAddress(placeDetails.adr_address) || '',
      ...parseAddressComponents(placeDetails.address_components)
    };
    
    // Set coordinates if available
    if (placeDetails.geometry?.location) {
      clinicData.address.coordinates = {
        lat: placeDetails.geometry.location.lat,
        lng: placeDetails.geometry.location.lng
      };
    }
    
    // Fetch photos (max 3)
    const googlePhotos = await withRateLimit(() => fetchPlacePhotos(placeId));
    if (googlePhotos.length > 0) {
      clinicData.photos = googlePhotos;
    }
  } catch (googleError) {
    console.error('Google Maps integration error:', googleError);
  }
}

    // Handle manual logo upload (takes precedence over Google photos)
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        clinicData.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload clinic logo' });
      }
    }

    // Handle manual photos upload (will be added alongside Google photos)
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
    const { userId } = req.user;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      return res.status(400).json({ message: 'Invalid clinic ID format' });
    }

    if (!updates || (Object.keys(updates).length === 0 && !req.files?.logo && !req.files?.photos)) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const admin = await Admin.findOne({ userId });
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const existingClinic = await Clinic.findById(clinicId);
    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    // Prepare update object using $set with dot notation
    const updateObj = { $set: {} };
    
    // Handle basic field updates
    if (updates.name !== undefined) updateObj.$set.name = updates.name;
    if (updates.description !== undefined) updateObj.$set.description = updates.description;

    // Handle Google Maps link update
    if (updates.googleMapsLink !== undefined) {
      updateObj.$set.googleMapsLink = updates.googleMapsLink;
      
      if (updates.googleMapsLink) {
        try {
          const placeId = await extractPlaceIdFromUrl(updates.googleMapsLink);
          const placeDetails = await withRateLimit(() => fetchPlaceDetails(placeId));

          // Update address fields individually using dot notation
          updateObj.$set['address.formattedAddress'] = cleanFormattedAddress(placeDetails.adr_address) || '';
          
          const addressComponents = parseAddressComponents(placeDetails.address_components);
          if (addressComponents.country) updateObj.$set['address.country'] = addressComponents.country;
          if (addressComponents.zipCode) updateObj.$set['address.zipCode'] = addressComponents.zipCode;
          if (addressComponents.state) updateObj.$set['address.state'] = addressComponents.state;
          if (addressComponents.city) updateObj.$set['address.city'] = addressComponents.city;

          if (placeDetails.geometry?.location) {
            updateObj.$set['address.coordinates'] = {
              lat: placeDetails.geometry.location.lat,
              lng: placeDetails.geometry.location.lng,
            };
          }

          const googlePhotos = await withRateLimit(() => fetchPlacePhotos(placeId));
          if (googlePhotos.length > 0) {
            updateObj.$set.photos = googlePhotos;
          }
        } catch (googleError) {
          console.error('Google Maps integration error:', googleError);
        }
      }
    }

    // Handle manual address update (only when Google Maps isn't being updated)
    if (!updates.googleMapsLink && updates.address) {
      Object.keys(updates.address).forEach(key => {
        if (updates.address[key] !== undefined) {
          updateObj.$set[`address.${key}`] = updates.address[key];
        }
      });
    }

    // Handle manual contact update
    if (updates.contact) {
      Object.keys(updates.contact).forEach(key => {
        if (updates.contact[key] !== undefined) {
          updateObj.$set[`contact.${key}`] = updates.contact[key];
        }
      });
    }

    // Handle manual logo upload
    if (req.files?.logo) {
      try {
        const result = await uploadToCloudinary(req.files.logo[0].path);
        updateObj.$set.logo = result.url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new logo' });
      }
    }

    // Handle manual photos upload
    if (req.files?.photos) {
      try {
        const newPhotos = await Promise.all(
          req.files.photos.map(async (file) => {
            const result = await uploadToCloudinary(file.path);
            return {
              url: result.url,
              uploadedAt: new Date(),
              originalName: file.originalname,
            };
          })
        );
        
        // Use $push for photos to add to array without replacing
        updateObj.$push = { photos: { $each: newPhotos } };
      } catch (uploadError) {
        console.error('Photos upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload new photos' });
      }
    }

    // Custom validation for the fields being updated
    const validationErrors = [];
    
    if (updateObj.$set.name !== undefined && updateObj.$set.name?.trim() === '') {
      validationErrors.push('Clinic name cannot be empty');
    }

    // Validate email if being updated
    if (updateObj.$set['contact.email'] && !isValidEmail(updateObj.$set['contact.email'])) {
      validationErrors.push('Invalid email format');
    }

    // Validate phone if being updated
    if (updateObj.$set['contact.phone'] && !isValidPhone(updateObj.$set['contact.phone'])) {
      validationErrors.push('Invalid phone format');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }

    // Update clinic with only the fields that need to be updated
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId, 
      updateObj, 
      {
        new: true,
        runValidators: false // We're handling validation manually
      }
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
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
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