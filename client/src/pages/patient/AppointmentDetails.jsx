import jsPDF from "jspdf";
import {
	AlertCircle,
	ArrowLeft,
	Building,
	Calendar,
	CheckCircle,
	Clock,
	Download,
	FileText,
	MapPin,
	Phone,
	Pill,
	Stethoscope,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RatingComponent from "../../components/Patient/RatingComponent";
import { getAppointmentDetails } from "../../service/appointmentApiService";
import { getPatientAppointmentPrescription } from "../../service/prescriptionApiSevice";

const AppointmentDetails = () => {
	const { appointmentId } = useParams();
	const navigate = useNavigate();
	const [appointment, setAppointment] = useState(null);
	const [existingRating, setExistingRating] = useState(null);
	const [prescription, setPrescription] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [downloadLoading, setDownloadLoading] = useState(false);

	useEffect(() => {
		if (appointmentId) {
			fetchAppointmentData();
		}
	}, [appointmentId]);
	const handleRatingUpdate = (updatedRating) => {
		setExistingRating(updatedRating);
	};
	const fetchAppointmentData = async () => {
		try {
			setLoading(true);
			setError(null);
			// Fetch appointment details
			const appointmentResponse = await getAppointmentDetails(appointmentId);
			setAppointment(
				appointmentResponse.appointment || appointmentResponse.data,
			);

			// Try to fetch prescription (it may not exist for all appointments)
			try {
				const prescriptionResponse =
					await getPatientAppointmentPrescription(appointmentId);
				console.log(prescriptionResponse);
				setPrescription(
					prescriptionResponse.prescription || prescriptionResponse.data,
				);
			} catch (prescriptionError) {
				// Prescription doesn't exist or user doesn't have access - this is okay
				console.log("No prescription found or access denied",prescriptionError);
				setPrescription(null);
			}
		} catch (err) {
			setError("Failed to load appointment details");
			console.error("Appointment details fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	// Frontend PDF generation function
	const generatePrescriptionPDF = () => {
		if (!prescription || !appointment) return;

		try {
			setDownloadLoading(true);

			const doc = new jsPDF();

			// Calculate patient age using appointment data
			const patientAge = Math.floor(
				(Date.now() - new Date(appointment.patientId.dateOfBirth)) /
					(365.25 * 24 * 60 * 60 * 1000),
			);

			let yPosition = 20;

			// Header
			doc.setFontSize(24);
			doc.setFont("helvetica", "bold");
			doc.text("℞ Medical Prescription", 105, yPosition, { align: "center" });

			yPosition += 10;
			doc.setFontSize(12);
			doc.setFont("helvetica", "normal");
			doc.text("Digital Healthcare Prescription", 105, yPosition, {
				align: "center",
			});

			yPosition += 8;
			doc.setFontSize(10);
			doc.text(
				`Prescription Date: ${new Date(prescription.date).toLocaleDateString(
					"en-US",
					{
						weekday: "long",
						month: "long",
						day: "numeric",
						year: "numeric",
					},
				)}`,
				105,
				yPosition,
				{ align: "center" },
			);

			// Add line separator
			yPosition += 10;
			doc.setLineWidth(0.5);
			doc.line(20, yPosition, 190, yPosition);
			yPosition += 15;

			// Patient Information Section - Use appointment data
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("PATIENT INFORMATION", 20, yPosition);
			yPosition += 8;

			doc.setFontSize(11);
			doc.setFont("helvetica", "normal");
			const patientInfo = [
				`Name: ${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`,
				`Age: ${patientAge} years`,
				`Gender: ${appointment.patientId?.gender || "Not specified"}`,
				`Phone: ${appointment.patientId?.phoneNumber || "Not specified"}`,
				`Date of Birth: ${appointment.patientId?.dateOfBirth ? new Date(appointment.patientId.dateOfBirth).toLocaleDateString("en-US") : "Not specified"}`,
			];

			patientInfo.forEach((info) => {
				doc.text(info, 20, yPosition);
				yPosition += 6;
			});

			yPosition += 5;

			// Doctor Information Section - Use appointment data
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("DOCTOR INFORMATION", 20, yPosition);
			yPosition += 8;

			doc.setFontSize(11);
			doc.setFont("helvetica", "normal");
			const doctorInfo = [
				`Name: Dr. ${appointment.doctorId?.firstName || ""} ${appointment.doctorId?.lastName || ""}`,
				`Specialization: ${appointment.doctorId?.specialization || "General Practice"}`,
				`License No: ${appointment.doctorId?.licenseNumber || "Not specified"}`,
				`Appointment Date: ${new Date(appointment.date).toLocaleDateString("en-US")}`,
				`Reason: ${appointment.reason || "General Consultation"}`,
			];

			doctorInfo.forEach((info) => {
				doc.text(info, 20, yPosition);
				yPosition += 6;
			});

			yPosition += 10;

			// Diagnosis Section
			if (prescription.diagnosis) {
				doc.setFontSize(14);
				doc.setFont("helvetica", "bold");
				doc.text("CLINICAL DIAGNOSIS", 20, yPosition);
				yPosition += 8;

				doc.setFontSize(11);
				doc.setFont("helvetica", "normal");
				const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 170);
				diagnosisLines.forEach((line) => {
					doc.text(line, 20, yPosition);
					yPosition += 6;
				});
				yPosition += 5;
			}

			// Medications Section
			if (prescription.medications && prescription.medications.length > 0) {
				// Check if we need a new page
				if (yPosition > 220) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setFontSize(14);
				doc.setFont("helvetica", "bold");
				doc.text("PRESCRIBED MEDICATIONS", 20, yPosition);
				yPosition += 10;

				// Table headers
				doc.setFontSize(10);
				doc.setFont("helvetica", "bold");
				doc.text("Medication", 20, yPosition);
				doc.text("Dosage", 80, yPosition);
				doc.text("Frequency", 120, yPosition);
				doc.text("Duration", 160, yPosition);
				yPosition += 5;

				// Table line
				doc.setLineWidth(0.3);
				doc.line(20, yPosition, 190, yPosition);
				yPosition += 5;

				// Medications
				doc.setFont("helvetica", "normal");
				prescription.medications.forEach((med, index) => {
					// Check if we need a new page
					if (yPosition > 270) {
						doc.addPage();
						yPosition = 20;
					}

					doc.text(`${index + 1}. ${med.name}`, 20, yPosition);
					doc.text(med.dosage, 80, yPosition);
					doc.text(med.frequency, 120, yPosition);
					doc.text(med.duration, 160, yPosition);
					yPosition += 6;

					if (med.instructions) {
						doc.setFontSize(9);
						doc.setFont("helvetica", "italic");
						const instructionLines = doc.splitTextToSize(
							`Instructions: ${med.instructions}`,
							170,
						);
						instructionLines.forEach((line) => {
							doc.text(line, 25, yPosition);
							yPosition += 5;
						});
						doc.setFontSize(10);
						doc.setFont("helvetica", "normal");
						yPosition += 2;
					}
				});
				yPosition += 5;
			}

			// Tests Section
			if (prescription.tests && prescription.tests.length > 0) {
				if (yPosition > 240) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setFontSize(14);
				doc.setFont("helvetica", "bold");
				doc.text("RECOMMENDED TESTS", 20, yPosition);
				yPosition += 8;

				doc.setFontSize(11);
				doc.setFont("helvetica", "normal");
				prescription.tests.forEach((test, index) => {
					doc.text(`${index + 1}. ${test.name}`, 20, yPosition);
					yPosition += 6;
					if (test.instructions) {
						doc.setFontSize(9);
						doc.setFont("helvetica", "italic");
						const testInstructions = doc.splitTextToSize(
							`Instructions: ${test.instructions}`,
							170,
						);
						testInstructions.forEach((line) => {
							doc.text(line, 25, yPosition);
							yPosition += 5;
						});
						doc.setFontSize(11);
						doc.setFont("helvetica", "normal");
						yPosition += 2;
					}
				});
				yPosition += 5;
			}

			// Additional Notes
			if (prescription.notes) {
				if (yPosition > 240) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setFontSize(14);
				doc.setFont("helvetica", "bold");
				doc.text("ADDITIONAL CLINICAL NOTES", 20, yPosition);
				yPosition += 8;

				doc.setFontSize(11);
				doc.setFont("helvetica", "normal");
				const notesLines = doc.splitTextToSize(prescription.notes, 170);
				notesLines.forEach((line) => {
					doc.text(line, 20, yPosition);
					yPosition += 6;
				});
				yPosition += 5;
			}

			// Follow-up
			if (prescription.followUpDate) {
				if (yPosition > 260) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setFontSize(14);
				doc.setFont("helvetica", "bold");
				doc.text("FOLLOW-UP CARE", 20, yPosition);
				yPosition += 8;

				doc.setFontSize(11);
				doc.setFont("helvetica", "normal");
				doc.text(
					`Next Appointment: ${new Date(
						prescription.followUpDate,
					).toLocaleDateString("en-US", {
						weekday: "long",
						month: "long",
						day: "numeric",
						year: "numeric",
					})}`,
					20,
					yPosition,
				);
				yPosition += 10;
			}

			// Move to bottom for signature
			const pageHeight = doc.internal.pageSize.height;
			yPosition = pageHeight - 50;

			// Signature section - Use appointment data
			doc.setFontSize(12);
			doc.setFont("helvetica", "bold");
			doc.text(
				`Dr. ${appointment.doctorId?.firstName || ""} ${appointment.doctorId?.lastName || ""}`,
				140,
				yPosition,
			);
			yPosition += 6;
			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			doc.text(
				appointment.doctorId?.specialization || "General Practice",
				140,
				yPosition,
			);
			if (appointment.doctorId?.licenseNumber) {
				yPosition += 6;
				doc.text(
					`License: ${appointment.doctorId.licenseNumber}`,
					140,
					yPosition,
				);
			}

			// Signature line
			doc.setLineWidth(0.5);
			doc.line(140, yPosition - 15, 190, yPosition - 15);

			// Footer
			yPosition = pageHeight - 20;
			doc.setFontSize(8);
			doc.setFont("helvetica", "italic");
			doc.text("This is a digitally generated prescription.", 105, yPosition, {
				align: "center",
			});
			yPosition += 4;
			doc.text(`Prescription ID: ${prescription._id}`, 105, yPosition, {
				align: "center",
			});
			yPosition += 4;
			doc.text(
				`Generated on: ${new Date().toLocaleDateString("en-US", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}`,
				105,
				yPosition,
				{ align: "center" },
			);

			// Save the PDF
			const fileName = `prescription_${prescription._id}_${new Date().toISOString().split("T")[0]}.pdf`;
			doc.save(fileName);
		} catch (error) {
			console.error("Error generating PDF:", error);
			setError("Failed to generate PDF");
		} finally {
			setDownloadLoading(false);
		}
	};

	// Rest of your existing functions (formatDate, formatTime, getStatusIcon, etc.)
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time) => {
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "confirmed":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-500" />;
			case "cancelled":
				return <XCircle className="h-5 w-5 text-red-500" />;
			case "completed":
				return <CheckCircle className="h-5 w-5 text-blue-500" />;
			default:
				return <AlertCircle className="h-5 w-5 text-gray-500" />;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading appointment details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => navigate(-1)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	if (!appointment) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600">Appointment not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Back to Appointments
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
						Appointment Details
					</h1>
					<p className="text-gray-600 mt-1">
						View appointment information and prescription details
					</p>
				</div>

				{/* Appointment Status Card */}
				<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-gray-900">
							Appointment Status
						</h2>
						<div className="flex items-center">
							{getStatusIcon(appointment.status)}
							<span className="ml-2 capitalize font-medium">
								{appointment.status}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<div className="flex items-center mb-2">
								<Calendar className="h-5 w-5 text-gray-400 mr-2" />
								<span className="font-medium">Date & Time</span>
							</div>
							<p className="text-gray-600 ml-7">
								{formatDate(appointment.date)}
							</p>
							<p className="text-gray-600 ml-7">
								{formatTime(appointment.startTime)} -{" "}
								{formatTime(appointment.endTime)}
							</p>
						</div>

						<div>
							<div className="flex items-center mb-2">
								<Clock className="h-5 w-5 text-gray-400 mr-2" />
								<span className="font-medium">Consultation Type</span>
							</div>
							<p className="text-gray-600 ml-7">
								{appointment.isTeleconsultation
									? "Video Consultation"
									: "In-Person Visit"}
							</p>
						</div>
					</div>

					{appointment.reason && (
						<div className="mt-4 pt-4 border-t border-gray-200">
							<div className="flex items-center mb-2">
								<FileText className="h-5 w-5 text-gray-400 mr-2" />
								<span className="font-medium">Reason for Visit</span>
							</div>
							<p className="text-gray-600 ml-7">{appointment.reason}</p>
						</div>
					)}
				</div>

				{/* Prescription Details */}
				{prescription && (
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								<Pill className="h-5 w-5 mr-2 text-blue-600" />
								Prescription Details
							</h2>
							<button
								onClick={generatePrescriptionPDF}
								disabled={downloadLoading}
								className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
							>
								<Download className="h-4 w-4 mr-2" />
								{downloadLoading ? "Generating PDF..." : "Download PDF"}
							</button>
						</div>

						{/* Prescription content - rest of your existing prescription JSX */}
						{prescription.diagnosis && (
							<div className="mb-4">
								<h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
								<p className="text-gray-600 bg-blue-50 p-3 rounded-md">
									{prescription.diagnosis}
								</p>
							</div>
						)}

						{prescription.medications &&
							prescription.medications.length > 0 && (
								<div className="mb-4">
									<h3 className="font-medium text-gray-900 mb-3">
										Medications
									</h3>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="bg-gray-50">
													<th className="text-left p-3 font-medium">
														Medication
													</th>
													<th className="text-left p-3 font-medium">Dosage</th>
													<th className="text-left p-3 font-medium">
														Frequency
													</th>
													<th className="text-left p-3 font-medium">
														Duration
													</th>
													<th className="text-left p-3 font-medium">
														Instructions
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{prescription.medications.map((med, index) => (
													<tr key={index}>
														<td className="p-3 font-medium text-gray-900">
															{med.name}
														</td>
														<td className="p-3 text-gray-600">{med.dosage}</td>
														<td className="p-3 text-gray-600">
															{med.frequency}
														</td>
														<td className="p-3 text-gray-600">
															{med.duration}
														</td>
														<td className="p-3 text-gray-600">
															{med.instructions || "Take as directed"}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}

						{prescription.tests && prescription.tests.length > 0 && (
							<div className="mb-4">
								<h3 className="font-medium text-gray-900 mb-3">
									Recommended Tests
								</h3>
								<ul className="space-y-2">
									{prescription.tests.map((test, index) => (
										<li key={index} className="bg-green-50 p-3 rounded-md">
											<span className="font-medium text-green-800">
												{test.name}
											</span>
											{test.instructions && (
												<p className="text-green-600 text-sm mt-1">
													Instructions: {test.instructions}
												</p>
											)}
										</li>
									))}
								</ul>
							</div>
						)}

						{prescription.notes && (
							<div className="mb-4">
								<h3 className="font-medium text-gray-900 mb-2">
									Additional Notes
								</h3>
								<p className="text-gray-600 bg-yellow-50 p-3 rounded-md">
									{prescription.notes}
								</p>
							</div>
						)}

						{prescription.followUpDate && (
							<div className="mb-4">
								<h3 className="font-medium text-gray-900 mb-2">
									Follow-up Date
								</h3>
								<p className="text-gray-600">
									{formatDate(prescription.followUpDate)}
								</p>
							</div>
						)}

						<div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
							<p>Prescription Date: {formatDate(prescription.date)}</p>
						</div>
					</div>
				)}

				{/* Doctor and Clinic Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
							Doctor Information
						</h3>
						<div className="space-y-2">
							<p>
								<span className="font-medium">Name:</span> Dr.{" "}
								{appointment.doctorId?.firstName}{" "}
								{appointment.doctorId?.lastName}
							</p>
							<p>
								<span className="font-medium">Specialization:</span>{" "}
								{appointment.doctorId?.specialization}
							</p>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Building className="h-5 w-5 mr-2 text-blue-600" />
							Clinic Information
						</h3>
						<div className="space-y-2">
							<p>
								<span className="font-medium">Clinic:</span>{" "}
								{appointment.clinicId?.name}
							</p>
							<div className="flex items-start">
								<MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
								<span className="text-sm text-gray-600">
									{appointment.clinicId.address.formattedAddress ||
										`${appointment.clinicId.address.city}, ${appointment.clinicId.address.state}`}
								</span>
							</div>
							{appointment.clinicId.phoneNumber && (
								<div className="flex items-center">
									<Phone className="h-4 w-4 text-gray-400 mr-1" />
									<span className="text-sm text-gray-600">
										{appointment.clinicId.phoneNumber}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			{appointment.status === "completed" && (
				<div className="mt-6">
					<RatingComponent
						appointmentId={appointmentId}
						doctorId={appointment.doctorId?._id || appointment.doctorId}
						clinicId={appointment.clinicId?._id || appointment.clinicId}
						existingRating={existingRating}
						onRatingUpdate={handleRatingUpdate}
					/>
				</div>
			)}
		</div>
	);
};

export default AppointmentDetails;
