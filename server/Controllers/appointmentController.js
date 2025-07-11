import Appointment from '../models/Appointment/Appointment.js';
import Schedule from '../models/Clinic/Schedule.js';
import mongoose from 'mongoose';

// Book a new appointment
export const bookAppointment = async (req, res) => {
  try {
    const { profileId } = req.user; // Patient's profile ID
    const { doctorId, clinicId, date, startTime, endTime, reason, isTeleconsultation } = req.body;

    if (!doctorId || !clinicId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Doctor, clinic, date, start time and end time are required',
        errors: {
          doctorId: !doctorId ? 'Doctor ID is required' : undefined,
          clinicId: !clinicId ? 'Clinic ID is required' : undefined,
          date: !date ? 'Date is required' : undefined,
          startTime: !startTime ? 'Start time is required' : undefined,
          endTime: !endTime ? 'End time is required' : undefined
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId) || 
        !mongoose.Types.ObjectId.isValid(clinicId) ||
        !mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const doctorSchedule = await Schedule.findOne({ doctorId });
    if (!doctorSchedule) {
      return res.status(400).json({ message: 'Doctor schedule not found' });
    }

    const appointmentDate = new Date(date);
    
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

// Get appointments for patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { profileId } = req.user;

    const appointments = await Appointment.find({ patientId: profileId })
      .populate('doctorId', 'name specialization profilePicture')
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

// Get appointments for doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { profileId } = req.user;
    const { status, date } = req.query;

    const query = { doctorId: profileId };
    
    if (status) {
      query.status = status;
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
      .populate('patientId', 'name profilePicture')
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
      { status },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'name email')
    .populate('doctorId', 'name')
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
