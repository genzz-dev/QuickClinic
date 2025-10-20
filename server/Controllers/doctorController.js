import mongoose from 'mongoose';
import Clinic from '../models/Clinic/Clinic.js';
import Doctor from '../models/Users/Doctor.js';
import { uploadToCloudinary } from '../services/uploadService.js';

// Create a doctor profile
export const createDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const doctorData = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if profile already exists
    const existingProfile = await Doctor.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ message: 'Doctor profile already exists' });
    }

    // Validate required fields
    if (!doctorData.specialization || !doctorData.qualifications) {
      return res.status(400).json({
        message: 'Specialization and qualifications are required',
        errors: {
          specialization: !doctorData.specialization ? 'Specialization is required' : undefined,
          qualifications: !doctorData.qualifications ? 'Qualifications are required' : undefined,
        },
      });
    }

    // Handle profile picture upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        doctorData.profilePicture = result.url;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    // Create doctor profile linked to user
    const doctor = new Doctor({
      userId,
      ...doctorData,
    });

    await doctor.save();

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor: doctor.toObject({ getters: true }),
    });
  } catch (error) {
    console.error('Error creating doctor profile:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }

    res.status(500).json({
      message: 'Failed to create doctor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { profileId } = req.user;
    const updates = req.body;

    if (!updates || (Object.keys(updates).length === 0 && !req.file)) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    // Handle profile picture update
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        updates.profilePicture = result.url;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    const doctor = await Doctor.findByIdAndUpdate(profileId, updates, {
      new: true,
      runValidators: true, // Ensure updates are validated
    }).select('-__v'); // Remove version key

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      message: 'Doctor profile updated successfully',
      doctor: doctor.toObject({ getters: true }),
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }

    res.status(500).json({
      message: 'Failed to update doctor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get doctor profile
export const getDoctorProfile = async (req, res) => {
  try {
    const { profileId } = req.user;

    // First check if doctor exists without populating
    const doctorExists = await Doctor.exists({ _id: profileId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Only populate fields that have data
    const doctor = await Doctor.findById(profileId).lean();

    const populateOptions = [];

    if (doctor.clinicId) {
      populateOptions.push({
        path: 'clinicId',
        select: 'name address contactInfo',
      });
    }

    if (doctor.appointments && doctor.appointments.length > 0) {
      populateOptions.push({
        path: 'appointments',
        select: '-__v',
        populate: {
          path: 'patientId',
          select: 'name profilePicture',
        },
      });
    }

    let populatedDoctor = doctor;
    if (populateOptions.length > 0) {
      populatedDoctor = await Doctor.findById(profileId).populate(populateOptions).lean();
    }

    // Remove sensitive or unnecessary fields
    delete populatedDoctor.__v;

    res.json(populatedDoctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all doctors by clinic
export const getDoctorsByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;

    // Validate clinic ID
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      return res.status(400).json({ message: 'Invalid clinic ID format' });
    }

    const doctors = await Doctor.find({ clinicId })
      .select('-appointments -ratings -__v')
      .populate('clinicId', 'name location')
      .lean();

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        message: 'No doctors found for this clinic',
        suggestions: 'Check if the clinic ID is correct',
      });
    }

    res.json({
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors by clinic:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
// Remove doctor from their current clinic (self-initiated)
export const leaveCurrentClinic = async (req, res) => {
  try {
    const { profileId } = req.user; // Doctor's profile ID from auth middleware

    // Find the doctor with their current clinic
    const doctor = await Doctor.findById(profileId).populate('clinicId', 'name');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Check if doctor is associated with any clinic
    if (!doctor.clinicId) {
      return res.status(400).json({
        message: 'Doctor is not currently associated with any clinic',
      });
    }

    const clinicId = doctor.clinicId._id;

    // Remove doctor from clinic's doctors array
    await Clinic.findByIdAndUpdate(clinicId, { $pull: { doctors: profileId } }, { new: true });

    // Remove clinic reference from doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      profileId,
      { $unset: { clinicId: 1 } },
      { new: true }
    ).select('-__v -appointments -ratings');

    res.json({
      message: `Successfully left ${doctor.clinicId.name} clinic`,
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error('Error leaving clinic:', error);
    res.status(500).json({
      message: 'Failed to leave clinic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Check doctor profile completion status
export const checkProfileStatus = async (req, res) => {
  try {
    const { profileId } = req.user;

    const doctor = await Doctor.findById(profileId).lean();

    if (!doctor) {
      return res.json({
        profileExists: false,
        isProfileComplete: false,
        hasClinic: false,
        message: 'No profile found',
      });
    }

    // Check if profile is complete
    const isProfileComplete =
      doctor &&
      doctor.firstName &&
      doctor.lastName &&
      doctor.specialization &&
      doctor.qualifications?.length > 0 &&
      doctor.consultationFee;

    // Check if doctor has clinic
    const hasClinic = !!doctor.clinicId;

    return res.json({
      profileExists: true,
      isProfileComplete,
      hasClinic,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        clinicId: doctor.clinicId,
      },
    });
  } catch (error) {
    console.error('Error checking profile status:', error);
    res.status(500).json({
      message: 'Failed to check profile status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Check doctor clinic association status
export const checkClinicStatus = async (req, res) => {
  try {
    const { profileId } = req.user;

    const doctor = await Doctor.findById(profileId)
      .populate('clinicId', 'name address contactInfo')
      .lean();

    if (!doctor) {
      return res.status(404).json({
        hasClinic: false,
        message: 'Doctor profile not found',
      });
    }

    const hasClinic = !!doctor.clinicId;

    return res.json({
      hasClinic,
      clinic: hasClinic
        ? {
            id: doctor.clinicId._id,
            name: doctor.clinicId.name,
            address: doctor.clinicId.address,
          }
        : null,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
      },
    });
  } catch (error) {
    console.error('Error checking clinic status:', error);
    res.status(500).json({
      message: 'Failed to check clinic status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
// Get doctor clinic info

export const getDoctorClinicInfo = async (req, res) => {
  try {
    const { profileId } = req.user;

    // Step 1: Fetch doctor to get clinicId
    const doctor = await Doctor.findById(profileId).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (!doctor.clinicId) {
      return res.status(404).json({ message: 'No clinic associated with this doctor' });
    }

    // Step 2: Fetch clinic directly using Clinic model
    const clinic = await Clinic.findById(doctor.clinicId);

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json({ clinic });
  } catch (error) {
    console.error('Error fetching doctor clinic info:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor clinic info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
// Get doctor schedule
export const getDoctorSchedule = async (req, res) => {
  try {
    const { profileId } = req.user; // Doctor's profile ID from auth middleware

    // Find the doctor and populate schedule
    const doctor = await Doctor.findById(profileId).populate('schedule').lean();

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Check if doctor has a schedule
    if (!doctor.schedule) {
      return res.status(404).json({
        message: 'No schedule found for this doctor',
        hasSchedule: false,
      });
    }

    res.json({
      message: 'Doctor schedule retrieved successfully',
      hasSchedule: true,
      schedule: doctor.schedule,
      doctorInfo: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
