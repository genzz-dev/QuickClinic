// services/emailService.js
import nodemailer from "nodemailer";
import { config } from "../config/email.js";

const transporter = nodemailer.createTransport({
	host: config.host,
	port: config.port,
	secure: config.secure,
	// Only include auth if we have user/pass configured
	...(config.user && config.pass
		? {
				auth: {
					user: config.user,
					pass: config.pass,
				},
			}
		: {}),
});

// Verify connection
transporter.verify((error) => {
	if (error) {
		console.error("Error with email configuration:", error);
	} else {
		console.log(
			`Email server is ready to send messages via ${config.host}:${config.port}`,
		);
	}
});

export const sendWelcomeEmail = async (email, name, role) => {
	try {
		const subject = `Welcome to ${config.appName}!`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to ${config.appName}, ${name}!</h2>
        <p>Your ${role} account has been successfully created.</p>
        <p>You can now log in to your account and start using our services.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${config.appName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending welcome email:", error);
		throw new Error("Failed to send welcome email");
	}
};

export const sendDoctorAddedToClinicEmail = async (
	email,
	doctorName,
	clinicName,
	adminName,
) => {
	try {
		const subject = `You've been added to ${clinicName}`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Hello Dr. ${doctorName},</h2>
        <p>You have been added to <strong>${clinicName}</strong> by ${adminName}.</p>
        <p>You can now start accepting appointments at this clinic.</p>
        <p>Log in to your account to set up your schedule and profile.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${config.appName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending doctor added to clinic email:", error);
		throw new Error("Failed to send doctor added to clinic email");
	}
};

/**
 * Send appointment confirmation email to patient
 * @param {string} email - Patient's email
 * @param {string} patientName - Patient's name
 * @param {Object} appointment - Appointment details
 * @param {string} doctorName - Doctor's name
 * @param {string} clinicName - Clinic name
 */
export const sendAppointmentConfirmation = async (
	email,
	patientName,
	appointment,
	doctorName,
	clinicName,
) => {
	try {
		const subject = `Your appointment with Dr. ${doctorName} is confirmed`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Appointment Confirmed</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment with Dr. ${doctorName} at ${clinicName} has been confirmed.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${new Date(appointment.date).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
          <li>Status: ${appointment.status}</li>
          ${appointment.isTeleconsultation ? `<li>Meeting Link: <a href="${appointment.meetingLink}">Join Teleconsultation</a></li>` : ""}
        </ul>
        <p>You can view or manage this appointment in your account dashboard.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${clinicName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending appointment confirmation email:", error);
		throw new Error("Failed to send appointment confirmation email");
	}
};

/**
 * Send appointment update notification
 * @param {string} email - Recipient's email
 * @param {string} name - Recipient's name
 * @param {Object} appointment - Updated appointment details
 * @param {string} doctorName - Doctor's name
 * @param {string} clinicName - Clinic name
 * @param {string} updateType - Type of update (rescheduled, cancelled, etc.)
 */
export const sendAppointmentUpdate = async (
	email,
	name,
	appointment,
	doctorName,
	clinicName,
	updateType,
) => {
	try {
		const subject = `Your appointment with Dr. ${doctorName} has been ${updateType}`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Appointment ${updateType.charAt(0).toUpperCase() + updateType.slice(1)}</h2>
        <p>Dear ${name},</p>
        <p>Your appointment with Dr. ${doctorName} at ${clinicName} has been ${updateType}.</p>
        <p><strong>Updated Details:</strong></p>
        <ul>
          <li>Date: ${new Date(appointment.date).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
          <li>Status: ${appointment.status}</li>
          ${appointment.isTeleconsultation ? `<li>Meeting Link: <a href="${appointment.meetingLink}">Join Teleconsultation</a></li>` : ""}
        </ul>
        ${updateType === "cancelled" ? "<p>We apologize for any inconvenience this may cause.</p>" : ""}
        <p>You can view or manage this appointment in your account dashboard.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${clinicName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending appointment update email:", error);
		throw new Error("Failed to send appointment update email");
	}
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, name, resetToken) => {
	try {
		const resetUrl = `${config.baseUrl}/reset-password?token=${resetToken}`;
		const subject = `Password Reset Request for ${config.appName}`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password for your ${config.appName} account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${config.appName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error("Failed to send password reset email");
	}
};

/**
 * Send health record upload notification
 * @param {string} email - Patient's email
 * @param {string} patientName - Patient's name
 * @param {Object} record - Health record details
 */
export const sendHealthRecordUploadedEmail = async (
	email,
	patientName,
	record,
) => {
	try {
		const subject = `New Health Record Uploaded`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Health Record Uploaded</h2>
        <p>Dear ${patientName},</p>
        <p>A new health record has been added to your account:</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Title: ${record.title}</li>
          <li>Type: ${record.recordType}</li>
          <li>Date: ${new Date(record.date).toLocaleDateString()}</li>
          ${record.description ? `<li>Description: ${record.description}</li>` : ""}
        </ul>
        <p>You can view this record in your account dashboard.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${config.appName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending health record uploaded email:", error);
		throw new Error("Failed to send health record uploaded email");
	}
};

/**
 * Send prescription ready notification
 * @param {string} email - Patient's email
 * @param {string} patientName - Patient's name
 * @param {Object} prescription - Prescription details
 * @param {string} doctorName - Doctor's name
 */
export const sendPrescriptionReadyEmail = async (
	email,
	patientName,
	prescription,
	doctorName,
) => {
	try {
		const subject = `Your prescription from Dr. ${doctorName} is ready`;
		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Prescription Ready</h2>
        <p>Dear ${patientName},</p>
        <p>Your prescription from Dr. ${doctorName} is now available.</p>
        ${prescription.diagnosis ? `<p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>` : ""}
        ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ""}
        ${prescription.followUpDate ? `<p><strong>Follow-up Date:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</p>` : ""}
        <p>You can view and download your prescription from your account dashboard.</p>
        <br>
        <p>Best regards,</p>
        <p>The ${config.appName} Team</p>
      </div>
    `;

		await transporter.sendMail({
			from: `"${config.appName}" <${config.from}>`,
			to: email,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending prescription ready email:", error);
		throw new Error("Failed to send prescription ready email");
	}
};
