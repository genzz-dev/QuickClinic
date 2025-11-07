import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

class PushNotificationService {
  constructor() {
    if (
      !process.env.VAPID_SUBJECT ||
      !process.env.VAPID_PUBLIC_KEY ||
      !process.env.VAPID_PRIVATE_KEY
    ) {
      throw new Error(
        'VAPID environment variables are required: VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY'
      );
    }
    // Initialize web push with VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  /**
   * Save patient's push subscription
   */
  async saveSubscription(patientId, userId, subscription, userAgent) {
    try {
      let pushSubscription = await PushSubscription.findOne({ patientId });

      if (pushSubscription) {
        // Update existing subscription
        pushSubscription.subscription = subscription;
        pushSubscription.userAgent = userAgent;
        pushSubscription.isActive = true;
        pushSubscription.lastUsedAt = new Date();
      } else {
        // Create new subscription
        pushSubscription = new PushSubscription({
          patientId,
          userId,
          subscription,
          userAgent,
          lastUsedAt: new Date(),
        });
      }

      await pushSubscription.save();
      console.log(`Push subscription saved for patient ${patientId}`);
      return pushSubscription;
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a single patient
   */
  async sendNotificationToPatient(patientId, notificationData) {
    try {
      const pushSubscription = await PushSubscription.findOne({
        patientId,
        isActive: true,
      });

      if (!pushSubscription) {
        console.log(`No active push subscription found for patient ${patientId}`);
        return { sent: false, reason: 'No subscription found' };
      }

      const payload = JSON.stringify({
        title: notificationData.title,
        body: notificationData.message,
        icon: notificationData.icon || '/logo-192x192.png',
        badge: '/logo-72x72.png',
        tag: notificationData.type, // Prevent duplicate notifications
        requireInteraction: notificationData.requireInteraction || false,
        data: {
          url: notificationData.url,
          notificationId: notificationData.notificationId,
          type: notificationData.type,
        },
        actions: notificationData.actions || [],
      });

      try {
        await webpush.sendNotification(pushSubscription.subscription, payload);

        // Update last used time
        pushSubscription.lastUsedAt = new Date();
        await pushSubscription.save();

        console.log(`Push notification sent to patient ${patientId}`);
        return { sent: true, patientId };
      } catch (pushError) {
        // Handle subscription errors (invalid/expired subscription)
        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
          // Subscription is invalid, mark as inactive
          pushSubscription.isActive = false;
          await pushSubscription.save();
          console.log(`Subscription marked inactive for patient ${patientId}`);
          return { sent: false, reason: 'Subscription expired' };
        }
        throw pushError;
      }
    } catch (error) {
      console.error(`Error sending push notification to patient ${patientId}:`, error);
      throw error;
    }
  }

  /**
   * Send push notification to multiple patients
   */
  async sendNotificationToPatients(patientIds, notificationData) {
    try {
      const results = [];

      for (const patientId of patientIds) {
        try {
          const result = await this.sendNotificationToPatient(patientId, notificationData);
          results.push(result);
        } catch (error) {
          console.error(`Failed to send to patient ${patientId}:`, error);
          results.push({ sent: false, patientId, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  }

  /**
   * Send appointment reminder via push
   */
  async sendAppointmentReminder(patientId, appointmentData) {
    const notificationData = {
      title: `Appointment Reminder - ${appointmentData.hoursUntil}h`,
      message: `You have an appointment with Dr. ${appointmentData.doctorName} at ${appointmentData.time}`,
      type: 'appointment_reminder',
      url: `/appointments/${appointmentData.appointmentId}`,
      notificationId: appointmentData.appointmentId,
      icon: '/appointment-icon.png',
      requireInteraction: true,
    };

    return this.sendNotificationToPatient(patientId, notificationData);
  }

  /**
   * Send appointment status change notification via push
   */
  async sendAppointmentStatusNotification(patientId, appointmentData, newStatus) {
    const statusMessages = {
      confirmed: 'Your appointment has been confirmed',
      cancelled: 'Your appointment has been cancelled',
      completed: 'Your appointment is complete',
      'no-show': 'You missed your appointment',
    };

    const notificationData = {
      title: 'Appointment Status Update',
      message: `${statusMessages[newStatus]} with Dr. ${appointmentData.doctorName}`,
      type: 'appointment_status_change',
      url: `/appointments/${appointmentData.appointmentId}`,
      notificationId: appointmentData.appointmentId,
      requireInteraction: newStatus === 'cancelled',
    };

    return this.sendNotificationToPatient(patientId, notificationData);
  }

  /**
   * Send prescription added notification via push
   */
  async sendPrescriptionNotification(patientId, prescriptionData) {
    const notificationData = {
      title: 'New Prescription Available',
      message: `Dr. ${prescriptionData.doctorName} has added a new prescription`,
      type: 'prescription_added',
      url: `/prescriptions/${prescriptionData.prescriptionId}`,
      notificationId: prescriptionData.prescriptionId,
      icon: '/prescription-icon.png',
      requireInteraction: true,
    };

    return this.sendNotificationToPatient(patientId, notificationData);
  }

  /**
   * Remove push subscription
   */
  async removeSubscription(patientId) {
    try {
      const result = await PushSubscription.findOneAndDelete({ patientId });
      console.log(`Push subscription removed for patient ${patientId}`);
      return result;
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  /**
   * Get VAPID public key (needed by client)
   */
  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY;
  }
}

export default new PushNotificationService();
