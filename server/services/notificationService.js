import Notification from '../models/Notification.js';
import Patient from '../models/Users/Patient.js';
import Appointment from '../models/Appointment/Appointment.js';
import Prescription from '../models/Appointment/Prescription.js';

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification({ patientId, type, title, message, relatedId, relatedModel }) {
    try {
      // Get patient to find userId
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const notification = new Notification({
        userId: patient.userId,
        patientId,
        type,
        title,
        message,
        relatedId,
        relatedModel,
      });

      await notification.save();

      // Emit real-time notification if socket.io is configured
      this.emitRealtimeNotification(patient.userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify patient about appointment status change
   */
  async notifyAppointmentStatusChange(appointmentId, newStatus) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName specialization');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const statusMessages = {
        confirmed: 'Your appointment has been confirmed',
        cancelled: 'Your appointment has been cancelled',
        completed: 'Your appointment has been completed',
        'no-show': 'You missed your appointment',
      };

      const title = 'Appointment Status Update';
      const message = `${statusMessages[newStatus]} with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`;

      return await this.createNotification({
        patientId: appointment.patientId._id,
        type: newStatus === 'cancelled' ? 'appointment_cancelled' : 'appointment_status_change',
        title,
        message,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      });
    } catch (error) {
      console.error('Error notifying appointment status change:', error);
      throw error;
    }
  }

  /**
   * Notify patient about prescription added
   */
  async notifyPrescriptionAdded(prescriptionId) {
    try {
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName specialization')
        .populate('appointmentId', 'date');

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      const title = 'New Prescription Available';
      const message = `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName} has added a new prescription for your appointment on ${new Date(prescription.appointmentId.date).toLocaleDateString()}`;

      return await this.createNotification({
        patientId: prescription.patientId._id,
        type: 'prescription_added',
        title,
        message,
        relatedId: prescriptionId,
        relatedModel: 'Prescription',
      });
    } catch (error) {
      console.error('Error notifying prescription added:', error);
      throw error;
    }
  }

  /**
   * Send appointment reminder (called by scheduler)
   */
  async sendAppointmentReminder(appointmentId, hoursBeforeAppointment = 24) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName specialization')
        .populate('clinicId', 'name address');

      if (
        !appointment ||
        appointment.status === 'cancelled' ||
        appointment.status === 'completed'
      ) {
        return null;
      }

      const title = `Appointment Reminder - ${hoursBeforeAppointment}h`;
      const message = `Reminder: You have an appointment with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} tomorrow at ${appointment.startTime}. Location: ${appointment.clinicId.name}`;

      return await this.createNotification({
        patientId: appointment.patientId._id,
        type: 'appointment_reminder',
        title,
        message,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      });
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a patient
   */
  async getPatientNotifications(patientId, { limit = 20, skip = 0, unreadOnly = false } = {}) {
    try {
      const query = { patientId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ patientId, isRead: false });

      return {
        notifications,
        totalCount,
        unreadCount,
      };
    } catch (error) {
      console.error('Error getting patient notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, patientId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, patientId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(patientId) {
    try {
      const result = await Notification.updateMany(
        { patientId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, patientId) {
    try {
      const result = await Notification.findOneAndDelete({ _id: notificationId, patientId });
      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Emit real-time notification via Socket.IO (if available)
   */
  emitRealtimeNotification(userId, notification) {
    try {
      // This requires Socket.IO to be configured
      // Import io from your socket configuration
      // const io = require('../socket').getIO();
      // io.to(userId.toString()).emit('notification', notification);

      // For now, this is a placeholder
      console.log(`Real-time notification would be sent to user ${userId}`);
    } catch (error) {
      console.error('Error emitting real-time notification:', error);
    }
  }
}

export default new NotificationService();
