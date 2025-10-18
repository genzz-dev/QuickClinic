import { ChevronRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../ui/Loading";
import StarRating from "../StarRating";

const ClinicDoctorsPopup = ({ clinic, hoveredClinic, clinicDoctors }) => {
	const navigate = useNavigate();

	const handleDoctorClick = (doctorId) => {
		navigate(`/doctor/${doctorId}`);
	};

	return (
		<>
			{/* Desktop Popup */}
			{hoveredClinic === clinic._id && (
				<div className="absolute top-0 left-full ml-2 w-80 bg-white rounded-lg shadow-xl border z-10 p-4 hidden md:block">
					<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
						<User className="h-4 w-4 mr-2" />
						Available Doctors
					</h4>
					{clinicDoctors[clinic._id] ? (
						<div className="space-y-3 max-h-60 overflow-y-auto">
							{clinicDoctors[clinic._id].map((doctor) => (
								<div
									key={doctor._id}
									className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										handleDoctorClick(doctor._id);
									}}
								>
									<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
										{doctor.profilePicture ? (
											<img
												src={doctor.profilePicture}
												alt={doctor.firstName}
												className="w-full h-full object-cover rounded-full"
											/>
										) : (
											<span className="text-white text-sm font-medium">
												{doctor.firstName.charAt(0)}
												{doctor.lastName.charAt(0)}
											</span>
										)}
									</div>
									<div className="flex-1">
										<div className="font-medium text-sm">
											Dr. {doctor.firstName} {doctor.lastName}
										</div>
										<div className="text-xs text-gray-500">
											{doctor.specialization}
										</div>
										<div className="flex items-center justify-between mt-1">
											{/* Use StarRating component with small size and inline display */}
											<StarRating
												type="doctor"
												id={doctor._id}
												size="small"
												inline={true}
												showCount={true}
												showAverage={true}
												detailed={false}
											/>
											<span className="text-xs text-gray-600">
												₹{doctor.consultationFee}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<Loading />
					)}
				</div>
			)}

			{/* Mobile doctors view */}
			{hoveredClinic === clinic._id && (
				<div className="md:hidden mt-4 border-t pt-4">
					<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
						<User className="h-4 w-4 mr-2" />
						Available Doctors
					</h4>
					{clinicDoctors[clinic._id] ? (
						<div className="space-y-2">
							{clinicDoctors[clinic._id].slice(0, 3).map((doctor) => (
								<div
									key={doctor._id}
									className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										handleDoctorClick(doctor._id);
									}}
								>
									<div className="flex-1">
										<div className="font-medium text-sm">
											Dr. {doctor.firstName} {doctor.lastName}
										</div>
										<div className="text-xs text-gray-500 mb-1">
											{doctor.specialization}
										</div>
										<div className="flex items-center justify-between">
											{/* Use StarRating component for mobile view */}
											<StarRating
												type="doctor"
												id={doctor._id}
												size="small"
												inline={true}
												showCount={true}
												showAverage={true}
												detailed={false}
											/>
											<span className="text-xs text-gray-600">
												₹{doctor.consultationFee}
											</span>
										</div>
									</div>
									<ChevronRight className="h-4 w-4 text-gray-400" />
								</div>
							))}
							{clinicDoctors[clinic._id].length > 3 && (
								<div className="text-center text-sm text-gray-500">
									+{clinicDoctors[clinic._id].length - 3} more doctors
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-1"></div>
							<p className="text-xs text-gray-500">Loading...</p>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default ClinicDoctorsPopup;
