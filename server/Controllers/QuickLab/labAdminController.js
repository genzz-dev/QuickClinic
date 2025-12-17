// controllers/labAdminController.js
import mongoose from 'mongoose';
import Lab from '../../models/Lab/Lab.js';
import LabAdmin from '../../models/Lab/LabAdmin.js';
import LabStaff from '../../models/Lab/LabStaff.js';
import User from '../../models/Users/User.js';
import { uploadToCloudinary } from '../../services/uploadService.js';

// Create lab admin profile
export const createLabAdminProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phoneNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const existingAdmin = await LabAdmin.findOne({ userId });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Lab admin profile already exists' });
    }

    if (!firstName || !lastName || !phoneNumber) {
      return res
        .status(400)
        .json({ message: 'First name, last name, and phone number are required' });
    }

    const labAdmin = new LabAdmin({
      userId,
      firstName,
      lastName,
      phoneNumber,
    });

    await labAdmin.save();

    res.status(201).json({
      message: 'Lab admin profile created successfully',
      labAdmin: labAdmin.toObject({ getters: true, versionKey: false }),
    });
  } catch (error) {
    console.error('Error creating lab admin profile:', error);
    res.status(500).json({
      message: 'Failed to create lab admin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create lab
export const createLab = async (req, res) => {
  try {
    const { userId, profileId } = req.user;
    const labData = req.body;

    // Rebuild nested fields from multipart form-data (dot-notation fallbacks)
    const contact = {
      phone:
        labData.contact?.phone || labData['contact.phone'] || labData.contactPhone || labData.phone,
      email:
        labData.contact?.email || labData['contact.email'] || labData.contactEmail || labData.email,
      website:
        labData.contact?.website ||
        labData['contact.website'] ||
        labData.contactWebsite ||
        labData.website,
    };

    const address = {
      formattedAddress:
        labData.address?.formattedAddress ||
        labData['address.formattedAddress'] ||
        labData.formattedAddress,
      city: labData.address?.city || labData['address.city'] || labData.city,
      state: labData.address?.state || labData['address.state'] || labData.state,
      zipCode: labData.address?.zipCode || labData['address.zipCode'] || labData.zipCode,
      country: labData.address?.country || labData['address.country'] || labData.country,
    };

    // Normalize numeric fee
    const generalHomeCollectionFee =
      labData.generalHomeCollectionFee !== undefined && labData.generalHomeCollectionFee !== ''
        ? Number(labData.generalHomeCollectionFee)
        : undefined;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin) {
      return res.status(404).json({ message: 'Lab admin profile not found' });
    }

    if (labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin can only manage one lab' });
    }

    if (!labData.name || !contact.phone) {
      return res.status(400).json({ message: 'Lab name and contact phone are required' });
    }

    // Handle file uploads
    if (req.files?.logo) {
      const result = await uploadToCloudinary(req.files.logo[0].path);
      labData.logo = result.url;
    }

    if (req.files?.photos) {
      const photoUrls = await Promise.all(
        req.files.photos.map(async (file) => {
          const result = await uploadToCloudinary(file.path);
          return result.url;
        })
      );
      labData.photos = photoUrls;
    }

    const lab = new Lab({
      ...labData,
      contact,
      address,
      generalHomeCollectionFee,
      labAdminId: profileId,
    });

    await lab.save();

    // Update lab admin with labId
    await LabAdmin.findByIdAndUpdate(profileId, { labId: lab._id });

    res.status(201).json({
      message: 'Lab created successfully',
      lab: lab.toObject({ getters: true, versionKey: false }),
    });
  } catch (error) {
    console.error('Error creating lab:', error);
    res.status(500).json({
      message: 'Failed to create lab',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const searchStaff = async (req, res) => {
  try {
    const { email, staffId } = req.query;

    if (!email && !staffId) {
      return res.status(400).json({ message: 'Email or staff ID is required' });
    }

    let staff;

    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        return res.status(400).json({ message: 'Invalid staff ID format' });
      }
      staff = await LabStaff.findById(staffId).populate('userId', 'email').lean();
    } else if (email) {
      const user = await User.findOne({ email, role: 'lab_staff' });
      if (user) {
        staff = await LabStaff.findOne({ userId: user._id }).populate('userId', 'email').lean();
      }
    }

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check if staff is already assigned to a lab
    if (staff.isAssignedToLab && staff.labId) {
      return res.status(400).json({
        message: 'Staff is already assigned to another lab',
        staff: {
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.userId.email,
        },
      });
    }

    res.json({
      message: 'Staff found',
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.userId.email,
        phoneNumber: staff.phoneNumber,
        role: staff.role,
        qualifications: staff.qualifications,
        experience: staff.experience,
        isProfileComplete: staff.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('Error searching staff:', error);
    res.status(500).json({ message: 'Failed to search staff' });
  }
};

// Add existing staff to lab by staffId
export const addStaffToLab = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { staffId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    const staff = await LabStaff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check if staff already assigned to a lab
    if (staff.isAssignedToLab && staff.labId) {
      return res.status(400).json({
        message: 'Staff is already assigned to another lab',
      });
    }

    // Assign staff to lab
    staff.labId = labAdmin.labId;
    staff.isAssignedToLab = true;
    await staff.save();

    // Add staff to lab's staff array
    await Lab.findByIdAndUpdate(labAdmin.labId, { $push: { staff: staffId } });

    res.json({
      message: 'Staff added to lab successfully',
      staff: staff.toObject({ getters: true, versionKey: false }),
    });
  } catch (error) {
    console.error('Error adding staff to lab:', error);
    res.status(500).json({ message: 'Failed to add staff to lab' });
  }
};

// Remove staff from lab
export const removeStaffFromLab = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { staffId } = req.params;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    const staff = await LabStaff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.labId.toString() !== labAdmin.labId.toString()) {
      return res.status(403).json({ message: 'Staff does not belong to your lab' });
    }

    // Remove lab association
    staff.labId = null;
    staff.isAssignedToLab = false;
    await staff.save();

    // Remove from lab's staff array
    await Lab.findByIdAndUpdate(labAdmin.labId, { $pull: { staff: staffId } });

    res.json({
      message: 'Staff removed from lab successfully',
    });
  } catch (error) {
    console.error('Error removing staff from lab:', error);
    res.status(500).json({ message: 'Failed to remove staff from lab' });
  }
};

// Get all staff members (existing method - keep as is)
export const getLabStaff = async (req, res) => {
  try {
    const { profileId } = req.user;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    const staff = await LabStaff.find({ labId: labAdmin.labId }).populate('userId', 'email').lean();

    res.json({
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
};

// Update test
export const updateTest = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { testId } = req.params;
    const updates = req.body;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    const lab = await Lab.findOneAndUpdate(
      { _id: labAdmin.labId, 'tests._id': testId },
      { $set: { 'tests.$': { _id: testId, ...updates } } },
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({
      message: 'Test updated successfully',
      lab,
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Failed to update test' });
  }
};

// Get lab info
export const getLabInfo = async (req, res) => {
  try {
    const { profileId } = req.user;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    const lab = await Lab.findById(labAdmin.labId)
      .populate('staff', 'firstName lastName role phoneNumber')
      .lean();

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ lab });
  } catch (error) {
    console.error('Error fetching lab info:', error);
    res.status(500).json({ message: 'Failed to fetch lab info' });
  }
};

export const addTest = async (req, res) => {
  try {
    const { profileId } = req.user;
    const {
      testName,
      testCode,
      category,
      description,
      price,
      preparationInstructions,
      sampleType,
      homeCollectionAvailable,
      homeCollectionFee,
      reportDeliveryTime,
      requiresEquipment,
      equipmentName,
    } = req.body;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    if (!testName || !category || !price) {
      return res.status(400).json({
        message: 'Test name, category, and price are required',
      });
    }

    // Auto-determine home collection based on category
    let canBeHomeCollected =
      homeCollectionAvailable !== undefined ? homeCollectionAvailable : false;

    let needsEquipment = requiresEquipment !== undefined ? requiresEquipment : false;

    // Automatic settings based on category
    const homeCollectionCategories = [
      'blood_test',
      'urine_test',
      'stool_test',
      'saliva_test',
      'swab_test',
    ];

    const equipmentCategories = ['imaging', 'endoscopy', 'ecg', 'pulmonary_function'];

    if (homeCollectionCategories.includes(category)) {
      canBeHomeCollected = true;
    }

    if (equipmentCategories.includes(category)) {
      needsEquipment = true;
      canBeHomeCollected = false; // Equipment tests cannot be home collected
    }

    const testData = {
      testName,
      testCode,
      category,
      description,
      price,
      preparationInstructions,
      sampleType,
      homeCollectionAvailable: canBeHomeCollected,
      homeCollectionFee: homeCollectionFee || 0,
      reportDeliveryTime,
      requiresEquipment: needsEquipment,
      equipmentName: needsEquipment ? equipmentName : undefined,
      isActive: true,
    };

    const Lab = (await import('../models/Lab/Lab.js')).default;
    const lab = await Lab.findByIdAndUpdate(
      labAdmin.labId,
      { $push: { tests: testData } },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      message: 'Test added successfully',
      test: lab.tests[lab.tests.length - 1],
    });
  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({
      message: 'Failed to add test',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Check if Lab Admin Profile Exists
export const checkLabAdminProfileExists = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const existingAdmin = await LabAdmin.findOne({ userId });

    if (existingAdmin) {
      return res.status(200).json({
        exists: true,
        message: 'Lab admin profile exists',
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: 'Lab admin profile does not exist',
      });
    }
  } catch (error) {
    console.error('Error checking lab admin profile:', error);
    res.status(500).json({
      message: 'Failed to check lab admin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Check if Lab Exists for the Lab Admin
export const checkLabExists = async (req, res) => {
  try {
    const { profileId } = req.user;

    // If no profile exists yet, return exists: false
    if (!profileId) {
      return res.status(200).json({
        exists: false,
        message: 'No lab admin profile found yet',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ message: 'Invalid profile ID format' });
    }

    const labAdmin = await LabAdmin.findById(profileId);

    if (labAdmin?.labId) {
      return res.status(200).json({
        exists: true,
        labId: labAdmin.labId,
        message: 'Lab already exists for this admin',
      });
    }

    return res.status(200).json({
      exists: false,
      message: 'No lab found for this admin',
    });
  } catch (error) {
    console.error('Error checking lab status:', error);
    res.status(500).json({
      message: 'Failed to check lab status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
