import nodemailer from 'nodemailer';
import { config } from '../config/email.js';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: config.auth
    ? {
        user: config.auth.user,
        pass: config.auth.pass,
      }
    : undefined,
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send emails');
  }
});

// Send welcome email when new account is created
export const sendWelcomeEmail = async (userEmail, userName, role) => {
  try {
    const mailOptions = {
      from: config.from,
      to: userEmail,
      subject: `Welcome to ${config.appName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #4CAF50;">Welcome to ${config.appName}!</h1>
          <p>Hi ${userName || 'there'},</p>
          <p>Thank you for registering with ${config.appName} as a <strong>${role}</strong>.</p>
          <p>Your account has been successfully created. You can now log in and start using our platform.</p>
          <div style="margin: 30px 0;">
            <a href="${config.baseUrl}/login" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from ${config.appName}.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send email when appointment is booked
export const sendAppointmentBookedEmail = async (patientEmail, appointmentDetails) => {
  try {
    const { doctorName, date, startTime, endTime, reason, clinicName } = appointmentDetails;

    const mailOptions = {
      from: config.from,
      to: patientEmail,
      subject: 'Appointment Booked Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #2196F3;">Appointment Confirmed</h1>
          <p>Your appointment has been successfully booked!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            ${clinicName ? `<p><strong>Clinic:</strong> ${clinicName}</p>` : ''}
          </div>
          
          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from ${config.appName}.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment booked email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending appointment booked email:', error);
    throw error;
  }
};

// Send email when appointment status changes
export const sendAppointmentStatusEmail = async (patientEmail, appointmentDetails, newStatus) => {
  try {
    const { doctorName, date, startTime, endTime } = appointmentDetails;

    const statusMessages = {
      confirmed: {
        subject: 'Appointment Confirmed',
        message: 'Your appointment has been confirmed by the doctor.',
        color: '#4CAF50',
      },
      cancelled: {
        subject: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled.',
        color: '#f44336',
      },
      completed: {
        subject: 'Appointment Completed',
        message: 'Your appointment has been marked as completed.',
        color: '#2196F3',
      },
      'no-show': {
        subject: 'Appointment Marked as No-Show',
        message: 'Your appointment was marked as no-show.',
        color: '#FF9800',
      },
    };

    const statusInfo = statusMessages[newStatus] || statusMessages.confirmed;

    const mailOptions = {
      from: config.from,
      to: patientEmail,
      subject: statusInfo.subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: ${statusInfo.color};">${statusInfo.subject}</h1>
          <p>${statusInfo.message}</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; text-transform: uppercase; font-weight: bold;">${newStatus}</span></p>
          </div>
          
          ${newStatus === 'cancelled' ? '<p>If you need to reschedule, please book a new appointment.</p>' : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from ${config.appName}.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Appointment ${newStatus} email sent:`, info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending appointment status email:', error);
    throw error;
  }
};

// Send email when prescription is added (with prescription details)
export const sendPrescriptionEmail = async (patientEmail, prescriptionDetails) => {
  try {
    const {
      patientName,
      doctorName,
      diagnosis,
      medications,
      tests,
      notes,
      appointmentDate,
      followUpDate,
    } = prescriptionDetails;

    // Format medications list
    const medicationsList = medications
      .map(
        (med) => `
      <li style="margin-bottom: 10px;">
        <strong>${med.name}</strong><br/>
        Dosage: ${med.dosage}<br/>
        Frequency: ${med.frequency}<br/>
        Duration: ${med.duration}
        ${med.instructions ? `<br/>Instructions: ${med.instructions}` : ''}
      </li>
    `
      )
      .join('');

    const mailOptions = {
      from: config.from,
      to: patientEmail,
      subject: 'Your Prescription from ' + doctorName,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #4CAF50;">New Prescription Available</h1>
          <p>Dear ${patientName},</p>
          <p>Your prescription from Dr. ${doctorName} is now available.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Prescription Details:</h3>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            ${diagnosis ? `<p><strong>Diagnosis:</strong> ${diagnosis}</p>` : ''}
            
            <h4>Medications:</h4>
            <ul style="list-style-type: none; padding-left: 0;">
              ${medicationsList}
            </ul>
            
            ${
              tests && tests.length > 0
                ? `
              <h4>Recommended Tests:</h4>
              <ul>
                ${tests.map((test) => `<li>${test}</li>`).join('')}
              </ul>
            `
                : ''
            }
            
            ${
              notes
                ? `
              <h4>Additional Notes:</h4>
              <p>${notes}</p>
            `
                : ''
            }
            
            ${
              followUpDate
                ? `
              <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">
                <strong>Follow-up Date:</strong> ${new Date(followUpDate).toLocaleDateString()}
              </p>
            `
                : ''
            }
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${config.baseUrl}/prescriptions" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Full Prescription
            </a>
          </div>
          
          <p style="color: #d32f2f; font-size: 14px;">
            <strong>Important:</strong> Please follow the prescribed medications as directed. Do not stop or change any medication without consulting your doctor.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from ${config.appName}.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Prescription email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending prescription email:', error);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
  sendAppointmentBookedEmail,
  sendAppointmentStatusEmail,
  sendPrescriptionEmail,
};
