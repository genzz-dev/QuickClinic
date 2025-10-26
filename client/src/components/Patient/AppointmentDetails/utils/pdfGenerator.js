import jsPDF from 'jspdf';

export const generatePrescriptionPDF = async (prescription, appointment, setDownloadLoading) => {
  if (!prescription || !appointment) return;

  try {
    setDownloadLoading(true);

    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('℞ Medical Prescription', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Healthcare Prescription', 105, yPosition, {
      align: 'center',
    });

    yPosition += 8;
    doc.setFontSize(10);
    doc.text(
      `Prescription Date: ${new Date(prescription.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      105,
      yPosition,
      { align: 'center' }
    );

    // Add line separator
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Patient Information Section
    const patientAge = Math.floor(
      (Date.now() - new Date(appointment.patientId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
    );

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const patientInfo = [
      `Name: ${appointment.patientId?.firstName || ''} ${appointment.patientId?.lastName || ''}`,
      `Age: ${patientAge} years`,
      `Gender: ${appointment.patientId?.gender || 'Not specified'}`,
      `Phone: ${appointment.patientId?.phoneNumber || 'Not specified'}`,
      `Date of Birth: ${appointment.patientId?.dateOfBirth ? new Date(appointment.patientId.dateOfBirth).toLocaleDateString('en-US') : 'Not specified'}`,
    ];

    patientInfo.forEach((info) => {
      doc.text(info, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Doctor Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCTOR INFORMATION', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const doctorInfo = [
      `Name: Dr. ${appointment.doctorId?.firstName || ''} ${appointment.doctorId?.lastName || ''}`,
      `Specialization: ${appointment.doctorId?.specialization || 'General Practice'}`,
      `License No: ${appointment.doctorId?.licenseNumber || 'Not specified'}`,
      `Appointment Date: ${new Date(appointment.date).toLocaleDateString('en-US')}`,
      `Reason: ${appointment.reason || 'General Consultation'}`,
    ];

    doctorInfo.forEach((info) => {
      doc.text(info, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Diagnosis Section
    if (prescription.diagnosis) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CLINICAL DIAGNOSIS', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 170);
      diagnosisLines.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Medications Section
    if (prescription.medications && prescription.medications.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PRESCRIBED MEDICATIONS', 20, yPosition);
      yPosition += 10;

      // Table headers
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Medication', 20, yPosition);
      doc.text('Dosage', 80, yPosition);
      doc.text('Frequency', 120, yPosition);
      doc.text('Duration', 160, yPosition);
      yPosition += 5;

      // Table line
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      // Medications
      doc.setFont('helvetica', 'normal');
      prescription.medications.forEach((med, index) => {
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
          doc.setFont('helvetica', 'italic');
          const instructionLines = doc.splitTextToSize(`Instructions: ${med.instructions}`, 170);
          instructionLines.forEach((line) => {
            doc.text(line, 25, yPosition);
            yPosition += 5;
          });
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
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
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDED TESTS', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      prescription.tests.forEach((test, index) => {
        doc.text(`${index + 1}. ${test.name}`, 20, yPosition);
        yPosition += 6;
        if (test.instructions) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          const testInstructions = doc.splitTextToSize(`Instructions: ${test.instructions}`, 170);
          testInstructions.forEach((line) => {
            doc.text(line, 25, yPosition);
            yPosition += 5;
          });
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
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
      doc.setFont('helvetica', 'bold');
      doc.text('ADDITIONAL CLINICAL NOTES', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
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
      doc.setFont('helvetica', 'bold');
      doc.text('FOLLOW-UP CARE', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Next Appointment: ${new Date(prescription.followUpDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}`,
        20,
        yPosition
      );
      yPosition += 10;
    }

    // Move to bottom for signature
    const pageHeight = doc.internal.pageSize.height;
    yPosition = pageHeight - 50;

    // Signature section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Dr. ${appointment.doctorId?.firstName || ''} ${appointment.doctorId?.lastName || ''}`,
      140,
      yPosition
    );
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.doctorId?.specialization || 'General Practice', 140, yPosition);
    if (appointment.doctorId?.licenseNumber) {
      yPosition += 6;
      doc.text(`License: ${appointment.doctorId.licenseNumber}`, 140, yPosition);
    }

    // Signature line
    doc.setLineWidth(0.5);
    doc.line(140, yPosition - 15, 190, yPosition - 15);

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a digitally generated prescription.', 105, yPosition, {
      align: 'center',
    });
    yPosition += 4;
    doc.text(`Prescription ID: ${prescription._id}`, 105, yPosition, {
      align: 'center',
    });
    yPosition += 4;
    doc.text(
      `Generated on: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      105,
      yPosition,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `prescription_${prescription._id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
