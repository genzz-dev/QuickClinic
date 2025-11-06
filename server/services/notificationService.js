import Notification from '../models/Notification.js';
import Patient from '../models/Users/Patient.js';
import Appointment from '../models/Appointment/Appointment.js';
import Prescription from '../models/Appointment/Prescription.js';
import pushNotificationService from './pushNotificationService.js';

class NotificationService {
  /**
   * Create a notification in database
   * Optionally triggers both push and database notifications
   */
  async createNotification({
    patientId,
    type,
    title,
    message,
    relatedId,
    relatedModel,
    sendPush = true,
    pushData = null,
  }) {
    try {
      // Validate patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      // Create database notification
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
      console.log(`Database notification created for patient ${patientId}: ${type}`);

      // Send push notification if enabled
      if (sendPush && pushData) {
        try {
          await this.sendPushNotification(patientId, pushData);
        } catch (pushError) {
          console.error(`Push notification failed for patient ${patientId}:`, pushError.message);
          // Don't throw - database notification already created
        }
      }

      // Emit real-time notification via Socket.IO if available
      try {
        this.emitRealtimeNotification(patient.userId, notification);
      } catch (socketError) {
        console.error('Socket.IO notification failed:', socketError.message);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error.message);
      throw error;
    }
  }

  /**
   * Send push notification to patient
   */
  async sendPushNotification(patientId, pushData) {
    try {
      if (!pushNotificationService) {
        console.warn('Push notification service not available');
        return null;
      }

      const result = await pushNotificationService.sendNotificationToPatient(patientId, pushData);

      if (result.sent) {
        console.log(`Push notification sent to patient ${patientId}`);
      } else {
        console.warn(`Push notification not sent to patient ${patientId}: ${result.reason}`);
      }

      return result;
    } catch (error) {
      console.error(`Error sending push notification to patient ${patientId}:`, error.message);
      throw error;
    }
  }

  /**
   * Notify patient about appointment status change
   * Sends both database and push notifications
   */
  async notifyAppointmentStatusChange(userId, appointmentId, newStatus) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', '_id firstName lastName email')
        .populate('doctorId', '_id firstName lastName specialization');

      if (!appointment) {
        throw new Error(`Appointment with ID ${appointmentId} not found`);
      }

      // Prepare status message
      const statusMessages = {
        confirmed: {
          title: 'Appointment Confirmed',
          message: 'Your appointment has been confirmed',
          push: 'confirmed',
        },
        cancelled: {
          title: 'Appointment Cancelled',
          message: 'Your appointment has been cancelled',
          push: 'appointment_cancelled',
        },
        completed: {
          title: 'Appointment Completed',
          message: 'Your appointment has been completed',
          push: 'completed',
        },
        'no-show': {
          title: 'Missed Appointment',
          message: 'You missed your scheduled appointment',
          push: 'no_show',
        },
      };

      const statusInfo = statusMessages[newStatus] || {
        title: 'Appointment Updated',
        message: `Your appointment status has been updated to ${newStatus}`,
        push: 'status_change',
      };

      const fullMessage = `${statusInfo.message} with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`;

      // Create database notification
      const dbNotification = await Notification.create({
        patientId: userId,
        type: newStatus === 'cancelled' ? 'appointment_cancelled' : 'appointment_status_change',
        title: statusInfo.title,
        message: fullMessage,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      });

      console.log(`Database notification created for appointment status change: ${newStatus}`);

      // Prepare and send push notification
      const pushNotificationData = {
        title: statusInfo.title,
        message: fullMessage,
        type: statusInfo.push,
        icon: '/icons/appointment-icon.png',
        badge: '/icons/badge.png',
        url: `/appointments/${appointmentId}`,
        notificationId: appointmentId,
        requireInteraction: newStatus === 'cancelled',
        actions: [
          {
            action: 'view',
            title: 'View Appointment',
          },
          {
            action: 'close',
            title: 'Close',
          },
        ],
      };

      try {
        await this.sendPushNotification(appointment.patientId._id, pushNotificationData);
      } catch (pushError) {
        console.error('Push notification failed for appointment status:', pushError.message);
      }

      // Emit real-time notification
      try {
        this.emitRealtimeNotification(appointment.patientId.userId, dbNotification);
      } catch (socketError) {
        console.error('Socket notification failed:', socketError.message);
      }

      return dbNotification;
    } catch (error) {
      console.error('Error notifying appointment status change:', error.message);
      throw error;
    }
  }

  /**
   * Notify patient about prescription added
   * Sends both database and push notifications
   */
  async notifyPrescriptionAdded(prescriptionId) {
    try {
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId', '_id firstName lastName userId email')
        .populate('doctorId', '_id firstName lastName specialization')
        .populate('appointmentId', 'date');

      if (!prescription) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }

      const appointmentDate = new Date(prescription.appointmentId.date).toLocaleDateString();
      const fullMessage = `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName} has added a new prescription for your appointment on ${appointmentDate}. Medications: ${prescription.medications.map((m) => m.name).join(', ')}`;

      // Create database notification
      const dbNotification = await Notification.create({
        userId: prescription.patientId.userId,
        patientId: prescription.patientId._id,
        type: 'prescription_added',
        title: 'New Prescription Available',
        message: fullMessage,
        relatedId: prescriptionId,
        relatedModel: 'Prescription',
      });

      console.log(`Database notification created for prescription: ${prescriptionId}`);

      // Prepare and send push notification
      const pushNotificationData = {
        title: 'New Prescription Available',
        message: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName} has added a new prescription`,
        type: 'prescription_added',
        icon: '/icons/prescription-icon.png',
        badge: '/icons/badge.png',
        url: `/prescriptions/${prescriptionId}`,
        notificationId: prescriptionId,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Prescription',
          },
          {
            action: 'download',
            title: 'Download',
          },
        ],
      };

      try {
        await this.sendPushNotification(prescription.patientId._id, pushNotificationData);
      } catch (pushError) {
        console.error('Push notification failed for prescription:', pushError.message);
      }

      // Emit real-time notification
      try {
        this.emitRealtimeNotification(prescription.patientId.userId, dbNotification);
      } catch (socketError) {
        console.error('Socket notification failed:', socketError.message);
      }

      return dbNotification;
    } catch (error) {
      console.error('Error notifying prescription added:', error.message);
      throw error;
    }
  }

  /**
   * Send appointment reminder
   * Called by scheduler 24 hours before appointment
   * Sends both database and push notifications
   */
  async sendAppointmentReminder(appointmentId, hoursBeforeAppointment = 24) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', '_id firstName lastName userId email')
        .populate('doctorId', '_id firstName lastName specialization')
        .populate('clinicId', '_id name address');

      // Skip if appointment doesn't exist or is not pending/confirmed
      if (!appointment) {
        console.warn(`Appointment ${appointmentId} not found for reminder`);
        return null;
      }

      if (!['pending', 'confirmed'].includes(appointment.status)) {
        console.log(
          `Appointment ${appointmentId} not in remindable status (${appointment.status})`
        );
        return null;
      }

      const appointmentTime = new Date(appointment.date);
      const timeString = appointmentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateString = appointmentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const fullMessage = `Reminder: You have an appointment with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} tomorrow (${dateString}) at ${timeString} at ${appointment.clinicId.name}, ${appointment.clinicId.address}`;

      // Create database notification
      const dbNotification = await Notification.create({
        userId: appointment.patientId.userId,
        patientId: appointment.patientId._id,
        type: 'appointment_reminder',
        title: `Appointment Reminder - ${hoursBeforeAppointment}h`,
        message: fullMessage,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      });

      console.log(`Database reminder notification created for appointment ${appointmentId}`);

      // Prepare and send push notification
      const pushNotificationData = {
        title: `Appointment Tomorrow at ${timeString}`,
        message: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} at ${appointment.clinicId.name}`,
        type: 'appointment_reminder',
        icon: '/icons/appointment-reminder-icon.png',
        badge: '/icons/badge.png',
        url: `/appointments/${appointmentId}`,
        notificationId: `reminder-${appointmentId}`,
        tag: `appointment-${appointmentId}`, // Prevents duplicate reminders
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details',
          },
          {
            action: 'reschedule',
            title: 'Reschedule',
          },
          {
            action: 'cancel',
            title: 'Cancel',
          },
        ],
      };

      try {
        await this.sendPushNotification(appointment.patientId._id, pushNotificationData);
      } catch (pushError) {
        console.error('Push notification failed for reminder:', pushError.message);
      }

      // Emit real-time notification
      try {
        this.emitRealtimeNotification(appointment.patientId.userId, dbNotification);
      } catch (socketError) {
        console.error('Socket notification failed:', socketError.message);
      }

      return dbNotification;
    } catch (error) {
      console.error(`Error sending appointment reminder for ${appointmentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get notifications for a patient with pagination
   */
  async getPatientNotifications(
    patientId,
    { limit = 20, skip = 0, unreadOnly = false, type = null } = {}
  ) {
    try {
      const query = { patientId };

      if (unreadOnly) {
        query.isRead = false;
      }

      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('relatedId')
        .lean();

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ patientId, isRead: false });

      console.log(`Retrieved ${notifications.length} notifications for patient ${patientId}`);

      return {
        notifications,
        totalCount,
        unreadCount,
        hasMore: skip + limit < totalCount,
      };
    } catch (error) {
      console.error('Error getting patient notifications:', error.message);
      throw error;
    }
  }

  /**
   * Get specific notification by ID
   */
  async getNotificationById(notificationId, patientId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        patientId,
      }).populate('relatedId');

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('Error getting notification by ID:', error.message);
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

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      console.log(`Notification ${notificationId} marked as read`);
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds, patientId) {
    try {
      const result = await Notification.updateMany(
        { _id: { $in: notificationIds }, patientId },
        { isRead: true, readAt: new Date() }
      );

      console.log(`${result.modifiedCount} notifications marked as read`);
      return result;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error.message);
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

      console.log(`All notifications for patient ${patientId} marked as read`);
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, patientId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        patientId,
      });

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      console.log(`Notification ${notificationId} deleted`);
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error.message);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds, patientId) {
    try {
      const result = await Notification.deleteMany({
        _id: { $in: notificationIds },
        patientId,
      });

      console.log(`${result.deletedCount} notifications deleted`);
      return result;
    } catch (error) {
      console.error('Error deleting multiple notifications:', error.message);
      throw error;
    }
  }

  /**
   * Delete all notifications for a patient
   */
  async deleteAllNotifications(patientId) {
    try {
      const result = await Notification.deleteMany({ patientId });

      console.log(`All notifications for patient ${patientId} deleted`);
      return result;
    } catch (error) {
      console.error('Error deleting all notifications:', error.message);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(patientId) {
    try {
      const totalCount = await Notification.countDocuments({ patientId });
      const unreadCount = await Notification.countDocuments({ patientId, isRead: false });

      const typeStats = await Notification.aggregate([
        { $match: { patientId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const recentNotifications = await Notification.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return {
        totalCount,
        unreadCount,
        readCount: totalCount - unreadCount,
        typeStats,
        recentNotifications,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error.message);
      throw error;
    }
  }

  /**
   * Send appointment cancellation notification
   * Special handling for cancellations
   */
  async notifyAppointmentCancellation(appointmentId, cancellationReason = '') {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', '_id firstName lastName userId email')
        .populate('doctorId', '_id firstName lastName specialization');

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      const fullMessage = `Your appointment with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime} has been cancelled${cancellationReason ? '. Reason: ' + cancellationReason : ''}`;

      // Create database notification
      const dbNotification = await Notification.create({
        userId: appointment.patientId.userId,
        patientId: appointment.patientId._id,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: fullMessage,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      });

      console.log(`Cancellation notification created for appointment ${appointmentId}`);

      // Prepare and send push notification
      const pushNotificationData = {
        title: 'Appointment Cancelled',
        message: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} - ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`,
        type: 'appointment_cancelled',
        icon: '/icons/cancel-icon.png',
        badge: '/icons/badge.png',
        url: `/appointments`,
        notificationId: appointmentId,
        requireInteraction: true,
        actions: [
          {
            action: 'reschedule',
            title: 'Book New Appointment',
          },
          {
            action: 'close',
            title: 'Close',
          },
        ],
      };

      try {
        await this.sendPushNotification(appointment.patientId._id, pushNotificationData);
      } catch (pushError) {
        console.error('Push notification failed for cancellation:', pushError.message);
      }

      // Emit real-time notification
      try {
        this.emitRealtimeNotification(appointment.patientId.userId, dbNotification);
      } catch (socketError) {
        console.error('Socket notification failed:', socketError.message);
      }

      return dbNotification;
    } catch (error) {
      console.error('Error notifying appointment cancellation:', error.message);
      throw error;
    }
  }

  /**
   * Emit real-time notification via Socket.IO
   * Requires Socket.IO to be configured
   */
  emitRealtimeNotification(userId, notification) {
    try {
      // Uncomment and configure if using Socket.IO
      // const io = require('../socket/socketConfig').getIO();
      // if (io) {
      //   io.to(userId.toString()).emit('notification', {
      //     _id: notification._id,
      //     type: notification.type,
      //     title: notification.title,
      //     message: notification.message,
      //     isRead: notification.isRead,
      //     createdAt: notification.createdAt,
      //   });
      //   console.log(`Real-time notification emitted to user ${userId}`);
      // }

      console.log(`Real-time notification would be sent to user ${userId}`);
    } catch (error) {
      console.error('Error emitting real-time notification:', error.message);
      // Don't throw - this shouldn't break notification system
    }
  }

  /**
   * Clean up old notifications (archive or delete)
   * Run periodically via cron job
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true,
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications older than ${daysOld} days`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error.message);
      throw error;
    }
  }
}

export default new NotificationService();
