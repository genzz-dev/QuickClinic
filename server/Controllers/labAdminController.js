// controllers/labAdminController.js
import mongoose from 'mongoose';
import Lab from '../models/Lab/Lab.js';
import LabAdmin from '../models/Lab/LabAdmin.js';
import LabStaff from '../models/Lab/LabStaff.js';
import User from '../models/Users/User.js';
import { uploadToCloudinary } from '../services/uploadService.js';

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

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin) {
      return res.status(404).json({ message: 'Lab admin profile not found' });
    }

    if (labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin can only manage one lab' });
    }

    if (!labData.name || !labData.contact?.phone) {
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

// Add staff member to lab
export const addStaffMember = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    const labAdmin = await LabAdmin.findById(profileId);
    if (!labAdmin || !labAdmin.labId) {
      return res.status(400).json({ message: 'Lab admin not associated with any lab' });
    }

    // Create user account for staff
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'lab_staff',
    });
    await user.save();

    // Create staff profile
    const staff = new LabStaff({
      userId: user._id,
      firstName,
      lastName,
      phoneNumber,
      labId: labAdmin.labId,
      role: role || 'assistant',
    });
    await staff.save();

    // Add staff to lab
    await Lab.findByIdAndUpdate(labAdmin.labId, { $push: { staff: staff._id } });

    res.status(201).json({
      message: 'Staff member added successfully',
      staff: staff.toObject({ getters: true, versionKey: false }),
    });
  } catch (error) {
    console.error('Error adding staff member:', error);
    res.status(500).json({
      message: 'Failed to add staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all staff members
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

    const LabAdmin = (await import('../models/Users/LabAdmin.js')).default;
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
