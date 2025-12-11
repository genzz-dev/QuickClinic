// controllers/labAppointmentController.js
import mongoose from 'mongoose';
import LabAppointment from '../models/Lab/LabAppointment.js';
import Lab from '../models/Lab/Lab.js';
import Patient from '../models/Users/Patient.js';
import LabStaff from '../models/Lab/LabStaff.js';
import LabReport from '../models/Lab/LabReport.js';

// Book lab appointment (by patient)
export const bookLabAppointment = async (req, res) => {
  try {
    const { profileId } = req.user;
    const {
      labId,
      tests, // Array of test IDs
      collectionType,
      appointmentDate,
      appointmentTime,
      collectionAddress,
      suggestedByDoctorId,
    } = req.body;

    if (
      !labId ||
      !tests ||
      tests.length === 0 ||
      !collectionType ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Fetch full test details from lab
    const selectedTests = [];
    let allTestsSupportHomeCollection = true;
    let anyTestRequiresEquipment = false;

    for (const testId of tests) {
      const test = lab.tests.id(testId);
      if (!test) {
        return res.status(404).json({
          message: `Test with ID ${testId} not found in this lab`,
        });
      }

      if (!test.isActive) {
        return res.status(400).json({
          message: `Test "${test.testName}" is currently not available`,
        });
      }

      // Check if test supports home collection
      if (!test.homeCollectionAvailable) {
        allTestsSupportHomeCollection = false;
      }

      // Check if test requires equipment (like X-ray, CT scan)
      if (test.requiresEquipment) {
        anyTestRequiresEquipment = true;
      }

      selectedTests.push({
        testId: test._id,
        testName: test.testName,
        testCode: test.testCode,
        category: test.category,
        price: test.price,
        homeCollectionAvailable: test.homeCollectionAvailable,
        requiresEquipment: test.requiresEquipment,
      });
    }

    // Validation: If user selected home collection, check if all tests support it
    if (collectionType === 'home_collection') {
      if (!allTestsSupportHomeCollection) {
        const nonHomeCollectionTests = selectedTests
          .filter((t) => !t.homeCollectionAvailable)
          .map((t) => t.testName);

        return res.status(400).json({
          message: 'Home collection not available for some selected tests',
          nonHomeCollectionTests,
          suggestion: 'These tests require you to visit the lab',
        });
      }

      if (anyTestRequiresEquipment) {
        const equipmentTests = selectedTests
          .filter((t) => t.requiresEquipment)
          .map((t) => t.testName);

        return res.status(400).json({
          message: 'Some tests require special equipment and must be done at the lab',
          equipmentRequiredTests: equipmentTests,
          suggestion: 'Please visit the lab for these tests',
        });
      }

      if (!collectionAddress) {
        return res.status(400).json({
          message: 'Collection address is required for home collection',
        });
      }
    }

    // Calculate total amount
    let totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
    let homeCollectionFee = 0;

    if (collectionType === 'home_collection') {
      // Use test-specific fees or general lab fee
      homeCollectionFee = selectedTests.reduce((sum, test) => {
        const testFromLab = lab.tests.id(test.testId);
        return sum + (testFromLab.homeCollectionFee || 0);
      }, 0);

      // If no test-specific fees, use general lab fee
      if (homeCollectionFee === 0) {
        homeCollectionFee = lab.generalHomeCollectionFee;
      }

      totalAmount += homeCollectionFee;
    }

    const appointment = new LabAppointment({
      patientId: profileId,
      labId,
      tests: selectedTests,
      collectionType,
      canBeHomeCollected: allTestsSupportHomeCollection,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      collectionAddress: collectionType === 'home_collection' ? collectionAddress : undefined,
      suggestedByDoctorId: suggestedByDoctorId || undefined,
      totalAmount,
      homeCollectionFee: collectionType === 'home_collection' ? homeCollectionFee : 0,
      status: 'pending',
    });

    await appointment.save();

    // Add to patient's lab appointments
    await Patient.findByIdAndUpdate(profileId, { $push: { labAppointments: appointment._id } });

    res.status(201).json({
      message: 'Lab appointment booked successfully',
      appointment: appointment.toObject({ getters: true }),
    });
  } catch (error) {
    console.error('Error booking lab appointment:', error);
    res.status(500).json({
      message: 'Failed to book lab appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Check if tests support home collection (helper endpoint)
export const checkHomeCollectionAvailability = async (req, res) => {
  try {
    const { labId, testIds } = req.body;

    if (!labId || !testIds || testIds.length === 0) {
      return res.status(400).json({ message: 'Lab ID and test IDs are required' });
    }

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const testDetails = [];
    let allSupport = true;
    let anyRequiresEquipment = false;
    let totalHomeCollectionFee = 0;

    for (const testId of testIds) {
      const test = lab.tests.id(testId);
      if (test) {
        testDetails.push({
          testId: test._id,
          testName: test.testName,
          category: test.category,
          homeCollectionAvailable: test.homeCollectionAvailable,
          requiresEquipment: test.requiresEquipment,
          homeCollectionFee: test.homeCollectionFee,
        });

        if (!test.homeCollectionAvailable) {
          allSupport = false;
        }

        if (test.requiresEquipment) {
          anyRequiresEquipment = true;
        }

        totalHomeCollectionFee += test.homeCollectionFee;
      }
    }

    // If no test-specific fees, use general lab fee
    if (totalHomeCollectionFee === 0 && allSupport) {
      totalHomeCollectionFee = lab.generalHomeCollectionFee;
    }

    res.json({
      homeCollectionAvailable: allSupport && !anyRequiresEquipment,
      allTestsSupportHomeCollection: allSupport,
      anyTestRequiresEquipment,
      homeCollectionFee: totalHomeCollectionFee,
      testDetails,
      message: !allSupport
        ? 'Some tests do not support home collection'
        : anyRequiresEquipment
          ? 'Some tests require special equipment and must be done at the lab'
          : 'All tests support home collection',
    });
  } catch (error) {
    console.error('Error checking home collection availability:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
};

// Get patient lab appointments
export const getPatientLabAppointments = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { status } = req.query;

    const query = { patientId: profileId };
    if (status) {
      query.status = status;
    }

    const appointments = await LabAppointment.find(query)
      .populate('labId', 'name address contact')
      .populate('assignedStaffId', 'firstName lastName phoneNumber')
      .populate('suggestedByDoctorId', 'firstName lastName specialization')
      .populate('reportId')
      .sort({ appointmentDate: -1 })
      .lean();

    res.json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching patient lab appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Get all lab appointments (for lab admin/staff)
export const getLabAppointments = async (req, res) => {
  try {
    const { profileId, role } = req.user;
    const { status, date, collectionType } = req.query;

    let labId;

    if (role === 'lab_admin') {
      const LabAdmin = (await import('../models/Users/LabAdmin.js')).default;
      const labAdmin = await LabAdmin.findById(profileId);
      if (!labAdmin || !labAdmin.labId) {
        return res.status(400).json({ message: 'Lab admin not associated with any lab' });
      }
      labId = labAdmin.labId;
    } else if (role === 'lab_staff') {
      const LabStaff = (await import('../models/Users/LabStaff.js')).default;
      const staff = await LabStaff.findById(profileId);
      if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
      }
      labId = staff.labId;
    }

    const query = { labId };
    if (status) {
      query.status = status;
    }
    if (collectionType) {
      query.collectionType = collectionType;
    }
    if (date) {
      const dateObj = new Date(date);
      query.appointmentDate = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    }

    const appointments = await LabAppointment.find(query)
      .populate('patientId', 'firstName lastName phoneNumber address')
      .populate('assignedStaffId', 'firstName lastName phoneNumber')
      .populate('suggestedByDoctorId', 'firstName lastName')
      .sort({ appointmentDate: 1 })
      .lean();

    // Separate home collection and visit lab appointments
    const homeCollectionAppointments = appointments.filter(
      (a) => a.collectionType === 'home_collection'
    );
    const visitLabAppointments = appointments.filter((a) => a.collectionType === 'visit_lab');

    res.json({
      count: appointments.length,
      appointments,
      summary: {
        homeCollection: homeCollectionAppointments.length,
        visitLab: visitLabAppointments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching lab appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Assign staff for home collection
export const assignStaffForCollection = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { staffId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const appointment = await LabAppointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.collectionType !== 'home_collection') {
      return res.status(400).json({
        message: 'This appointment is not for home collection',
        collectionType: appointment.collectionType,
      });
    }

    const LabStaff = (await import('../models/Users/LabStaff.js')).default;
    const staff = await LabStaff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (!staff.isAvailableForHomeCollection) {
      return res.status(400).json({
        message: 'Staff member is not available for home collection',
      });
    }

    appointment.assignedStaffId = staffId;
    appointment.status = 'confirmed';
    await appointment.save();

    // Add to staff current assignments
    await LabStaff.findByIdAndUpdate(staffId, { $push: { currentAssignments: appointmentId } });

    res.json({
      message: 'Staff assigned successfully',
      appointment: await appointment.populate('assignedStaffId', 'firstName lastName phoneNumber'),
    });
  } catch (error) {
    console.error('Error assigning staff:', error);
    res.status(500).json({ message: 'Failed to assign staff' });
  }
};

// Update appointment status
export const updateLabAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'confirmed',
      'sample_collected',
      'processing',
      'completed',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await LabAppointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName')
      .populate('labId', 'name')
      .lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};
