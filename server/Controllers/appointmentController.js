import Appointment from '../models/Appointment/Appointment.js';
import Schedule from '../models/Clinic/Schedule.js';
import mongoose from 'mongoose';
import Doctor from '../models/Users/Doctor.js';
import Patient from '../models/Users/Patient.js';
import HealthRecord from '../models/HealthRecord/HealthRecord.js'

// Book a new appointment
export const bookAppointment = async (req, res) => {
  try {
    const { profileId } = req.user; // Patient's profile ID
    const { doctorId, date, startTime, endTime, reason, isTeleconsultation } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Doctor, date, start time and end time are required',
        errors: {
          doctorId: !doctorId ? 'Doctor ID is required' : undefined,
          date: !date ? 'Date is required' : undefined,
          startTime: !startTime ? 'Start time is required' : undefined,
          endTime: !endTime ? 'End time is required' : undefined
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId) || 
        !mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Check if appointment is in the future
    const appointmentDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < currentDate) {
      return res.status(400).json({ message: 'Cannot book appointment in the past' });
    }

    // Check if doctor exists and get their clinic
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.clinicId) {
      return res.status(400).json({ message: 'Doctor is not associated with any clinic. Cannot book appointment.' });
    }

    const clinicId = doctor.clinicId;

    const doctorSchedule = await Schedule.findOne({ doctorId });
    if (!doctorSchedule) {
      return res.status(400).json({ message: 'Doctor schedule not found' });
    }

    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = doctorSchedule.workingDays.find(day => day.day === dayOfWeek);
    
    if (!workingDay || !workingDay.isWorking) {
      return res.status(400).json({ message: 'Doctor is not available on the selected day' });
    }

    if (startTime < workingDay.startTime || endTime > workingDay.endTime) {
      return res.status(400).json({ message: 'Selected time is outside doctor working hours' });
    }

    const overlappingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    if (overlappingAppointment) {
      return res.status(409).json({ 
        message: 'Time slot already booked',
        conflictingAppointment: {
          id: overlappingAppointment._id,
          startTime: overlappingAppointment.startTime,
          endTime: overlappingAppointment.endTime
        }
      });
    }

    const conflictingBreak = doctorSchedule.breaks.find(breakItem => {
      return breakItem.day === dayOfWeek && 
             breakItem.startTime < endTime && 
             breakItem.endTime > startTime;
    });

    if (conflictingBreak) {
      return res.status(409).json({ 
        message: 'Doctor has a break during this time',
        breakDetails: conflictingBreak
      });
    }

    const conflictingVacation = doctorSchedule.vacations.find(vacation => {
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      return appointmentDate >= vacationStart && appointmentDate <= vacationEnd;
    });

    if (conflictingVacation) {
      return res.status(409).json({ 
        message: 'Doctor is on vacation during this time',
        vacationDetails: conflictingVacation
      });
    }

    const appointment = new Appointment({
      patientId: profileId,
      doctorId,
      clinicId,
      date: appointmentDate,
      startTime,
      endTime,
      reason,
      isTeleconsultation: isTeleconsultation || false,
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: appointment.toObject({ getters: true })
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to book appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointments for patient with filters
export const getPatientAppointments = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { status, date, upcoming, past } = req.query;

    const query = { patientId: profileId };
    
    if (status) {
      query.status = status;
    }
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (upcoming === 'true') {
      query.date = { $gte: currentDate };
    } else if (past === 'true') {
      query.date = { $lt: currentDate };
    }
    
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'firstName lastName specialization profilePicture')
      .populate('clinicId', 'name address')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointments for doctor with filters
export const getDoctorAppointments = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { status, date, upcoming, past } = req.query;

    const query = { doctorId: profileId };
    
    if (status) {
      query.status = status;
    }
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (upcoming === 'true') {
      query.date = { $gte: currentDate };
    } else if (past === 'true') {
      query.date = { $lt: currentDate };
    }
    
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('clinicId', 'name address')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all appointments for admin (clinic-specific)
export const getClinicAppointments = async (req, res) => {
  try {
    const { profileId, clinicId } = req.user;
    const { status, date, upcoming, past, doctorId, patientId } = req.query;

    if (!clinicId) {
      return res.status(400).json({ message: 'Admin is not associated with any clinic' });
    }

    const query = { clinicId };
    
    if (status) {
      query.status = status;
    }
    
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID format' });
      }
      query.doctorId = doctorId;
    }
    
    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID format' });
      }
      query.patientId = patientId;
    }
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (upcoming === 'true') {
      query.date = { $gte: currentDate };
    } else if (past === 'true') {
      query.date = { $lt: currentDate };
    }
    
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName profilePicture phoneNumber')
      .populate('doctorId', 'firstName lastName specialization profilePicture')
      .populate('clinicId', 'name address')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error fetching clinic appointments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update appointment (patient can reschedule)
export const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { profileId, role } = req.user;
    const { doctorId, date, startTime, endTime, reason, isTeleconsultation } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to update this appointment
    if (role === 'patient' && appointment.patientId.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this appointment' });
    }

    // Check if appointment is in the future
    if (date) {
      const appointmentDate = new Date(date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate < currentDate) {
        return res.status(400).json({ message: 'Cannot reschedule appointment to a past date' });
      }
    }

    // If rescheduling (date/time changes), validate availability
    if (date || startTime || endTime || doctorId) {
      const newDoctorId = doctorId || appointment.doctorId;
      const newDate = date ? new Date(date) : appointment.date;
      const newStartTime = startTime || appointment.startTime;
      const newEndTime = endTime || appointment.endTime;

      // Check doctor availability
      const doctor = await Doctor.findById(newDoctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const doctorSchedule = await Schedule.findOne({ doctorId: newDoctorId });
      if (!doctorSchedule) {
        return res.status(400).json({ message: 'Doctor schedule not found' });
      }

      const dayOfWeek = newDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const workingDay = doctorSchedule.workingDays.find(day => day.day === dayOfWeek);
      
      if (!workingDay || !workingDay.isWorking) {
        return res.status(400).json({ message: 'Doctor is not available on the selected day' });
      }

      if (newStartTime < workingDay.startTime || newEndTime > workingDay.endTime) {
        return res.status(400).json({ message: 'Selected time is outside doctor working hours' });
      }

      // Check for conflicts (excluding current appointment)
      const overlappingAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctorId: newDoctorId,
        date: newDate,
        $or: [
          { startTime: { $lt: newEndTime }, endTime: { $gt: newStartTime } },
          { startTime: { $gte: newStartTime, $lt: newEndTime } },
          { endTime: { $gt: newStartTime, $lte: newEndTime } }
        ],
        status: { $in: ['pending', 'confirmed'] }
      });

      if (overlappingAppointment) {
        return res.status(409).json({ 
          message: 'Time slot already booked',
          conflictingAppointment: {
            id: overlappingAppointment._id,
            startTime: overlappingAppointment.startTime,
            endTime: overlappingAppointment.endTime
          }
        });
      }
    }

    // Update appointment
    const updateData = {};
    if (doctorId) updateData.doctorId = doctorId;
    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (reason !== undefined) updateData.reason = reason;
    if (isTeleconsultation !== undefined) updateData.isTeleconsultation = isTeleconsultation;
    updateData.updatedAt = new Date();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('patientId', 'firstName lastName profilePicture')
    .populate('doctorId', 'firstName lastName specialization')
    .populate('clinicId', 'name address')
    .lean();

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to update appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update appointment status (for admin/doctor)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['pending', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'firstName lastName email')
    .populate('doctorId', 'firstName lastName')
    .lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to update appointment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointment details by ID
export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { profileId, role } = req.user;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'firstName lastName profilePicture phoneNumber email')
      .populate('doctorId', 'firstName lastName specialization profilePicture')
      .populate('clinicId', 'name address phoneNumber')
      .lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to view this appointment
    if (role === 'patient' && appointment.patientId._id.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this appointment' });
    }

    if (role === 'doctor' && appointment.doctorId._id.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this appointment' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { profileId, role } = req.user;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to cancel this appointment
    if (role === 'patient' && appointment.patientId.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to cancel this appointment' });
    }

    if (role === 'doctor' && appointment.doctorId.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to cancel this appointment' });
    }

    // Check if appointment is already cancelled or completed
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'firstName lastName')
    .populate('doctorId', 'firstName lastName')
    .lean();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      message: 'Failed to cancel appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Get patient info for appointment (Doctor only)
export const getPatientInfoForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { profileId, role } = req.user;

    // Check appointment exists and doctor owns it
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role !== 'doctor' || appointment.doctorId.toString() !== profileId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get patient info
    const patient = await Patient.findById(appointment.patientId)
      .populate('healthRecords')
      .lean();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Calculate age
    const age = Math.floor((Date.now() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));

    res.json({
      patient: {
        ...patient,
        age
      }
    });

  } catch (error) {
    console.error('Error fetching patient info:', error);
    res.status(500).json({ message: 'Failed to fetch patient info' });
  }
};