import cron from 'node-cron';
import Appointment from '../models/Appointment/Appointment.js';
import notificationService from './notificationService.js';

class AppointmentScheduler {
  constructor() {
    this.job = null;
  }

  /**
   * Start the scheduler - runs every hour
   */
  start() {
    // Run every hour at minute 0
    this.job = cron.schedule('0 * * * *', async () => {
      console.log('Running appointment reminder check...');
      await this.checkUpcomingAppointments();
    });

    console.log('Appointment reminder scheduler started');
  }

  /**
   * Check for appointments in the next 24 hours
   */
  async checkUpcomingAppointments() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(now.getHours() + 24);
      tomorrow.setMinutes(0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setHours(tomorrow.getHours() + 1);

      // Find appointments 24 hours ahead (within the next hour window)
      const upcomingAppointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow,
        },
        status: { $in: ['pending', 'confirmed'] },
      });

      console.log(`Found ${upcomingAppointments.length} appointments for reminder`);

      // Send reminders
      for (const appointment of upcomingAppointments) {
        try {
          await notificationService.sendAppointmentReminder(appointment._id, 24);
          console.log(`Reminder sent for appointment ${appointment._id}`);
        } catch (error) {
          console.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('Appointment reminder scheduler stopped');
    }
  }
}

export default new AppointmentScheduler();
