// controllers/labStaffController.js
import mongoose from 'mongoose';
import LabStaff from '../../models/Lab/LabStaff.js';
import LabAppointment from '../../models/Lab/LabAppointment.js';
import Lab from '../../models/Lab/Lab.js';
import { uploadToCloudinary } from '../../services/uploadService.js';

// Create staff profile (after user registration)
export const createStaffProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phoneNumber, role, qualifications, experience } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const existingStaff = await LabStaff.findOne({ userId });
    if (existingStaff) {
      return res.status(409).json({ message: 'Staff profile already exists' });
    }

    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        message: 'First name, last name, and phone number are required',
      });
    }

    // Handle profile picture upload
    let profilePicture;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      profilePicture = result.url;
    }

    const staff = new LabStaff({
      userId,
      firstName,
      lastName,
      phoneNumber,
      role: role || 'assistant',
      qualifications: qualifications || [],
      experience: experience || 0,
      profilePicture,
      isProfileComplete: true,
    });

    await staff.save();

    res.status(201).json({
      message: 'Staff profile created successfully',
      staff: staff.toObject({ getters: true, versionKey: false }),
      staffId: staff._id, // Important: staff needs to share this with admin
    });
  } catch (error) {
    console.error('Error creating staff profile:', error);
    res.status(500).json({
      message: 'Failed to create staff profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update staff profile
export const updateStaffProfile = async (req, res) => {
  try {
    const { profileId } = req.user;
    const updates = req.body;

    if (!updates || (Object.keys(updates).length === 0 && !req.file)) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    // Handle profile picture update
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      updates.profilePicture = result.url;
    }

    const staff = await LabStaff.findByIdAndUpdate(profileId, updates, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    res.json({
      message: 'Staff profile updated successfully',
      staff: staff.toObject({ getters: true }),
    });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Failed to update staff profile' });
  }
};

// Get staff own profile
export const getStaffProfile = async (req, res) => {
  try {
    const { profileId } = req.user;

    const staff = await LabStaff.findById(profileId)
      .populate('userId', 'email')
      .populate('labId', 'name address contact')
      .lean();

    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    res.json({
      staff,
    });
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Failed to fetch staff profile' });
  }
};

// Check if staff profile exists
export const checkStaffProfileExists = async (req, res) => {
  try {
    const { userId } = req.user;

    const staff = await LabStaff.findOne({ userId });

    if (staff) {
      return res.json({
        exists: true,
        isProfileComplete: staff.isProfileComplete,
        isAssignedToLab: staff.isAssignedToLab,
        staffId: staff._id,
        labId: staff.labId,
      });
    }

    res.json({
      exists: false,
      isProfileComplete: false,
      isAssignedToLab: false,
    });
  } catch (error) {
    console.error('Error checking staff profile:', error);
    res.status(500).json({ message: 'Failed to check staff profile' });
  }
};

// Get staff assigned tasks/appointments
export const getMyAssignments = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { status, type } = req.query; // type: current or completed

    const staff = await LabStaff.findById(profileId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    let query = { assignedStaffId: profileId };

    if (status) {
      query.status = status;
    }

    // Filter by current or completed
    if (type === 'completed') {
      query.status = 'completed';
    } else if (type === 'current') {
      query.status = { $in: ['confirmed', 'sample_collected', 'processing'] };
    }

    const assignments = await LabAppointment.find(query)
      .populate('patientId', 'firstName lastName phoneNumber address')
      .populate('labId', 'name address')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    res.json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching staff assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
};

// Get specific assignment details
export const getAssignmentDetails = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { appointmentId } = req.params;

    const staff = await LabStaff.findById(profileId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    const assignment = await LabAppointment.findById(appointmentId)
      .populate('patientId', 'firstName lastName phoneNumber address emergencyContact')
      .populate('labId', 'name address contact')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if this assignment belongs to this staff
    if (assignment.assignedStaffId?.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this assignment' });
    }

    res.json({
      assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({ message: 'Failed to fetch assignment details' });
  }
};

// Update assignment status (staff can update their own assignments)
export const updateMyAssignmentStatus = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['confirmed', 'sample_collected', 'processing'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          'Invalid status. Staff can only update to: confirmed, sample_collected, processing',
      });
    }

    const assignment = await LabAppointment.findById(appointmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if this assignment belongs to this staff
    if (assignment.assignedStaffId?.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this assignment' });
    }

    assignment.status = status;
    if (notes) {
      assignment.notes = notes;
    }
    await assignment.save();

    // If completed, move to completed assignments
    if (status === 'completed') {
      await LabStaff.findByIdAndUpdate(profileId, {
        $pull: { currentAssignments: appointmentId },
        $push: { completedAssignments: appointmentId },
      });
    }

    res.json({
      message: 'Assignment status updated successfully',
      assignment: await assignment.populate([
        { path: 'patientId', select: 'firstName lastName' },
        { path: 'labId', select: 'name' },
      ]),
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ message: 'Failed to update assignment status' });
  }
};

// Mark assignment as completed
export const completeAssignment = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { appointmentId } = req.params;
    const { notes } = req.body;

    const assignment = await LabAppointment.findById(appointmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.assignedStaffId?.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    assignment.status = 'sample_collected';
    if (notes) {
      assignment.notes = notes;
    }
    await assignment.save();

    res.json({
      message: 'Sample collection marked as completed',
      assignment,
    });
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ message: 'Failed to complete assignment' });
  }
};
