import React from "react";
import { Stethoscope, Award, Phone, Calendar, User } from "lucide-react";

const DoctorHeader = ({ doctor }) => {
	const renderStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;

		for (let i = 0; i < fullStars; i++) {
			stars.push(
				<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
			);
		}

		if (hasHalfStar) {
			stars.push(
				<Star
					key="half"
					className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50"
				/>,
			);
		}

		const emptyStars = 5 - Math.ceil(rating);
		for (let i = 0; i < emptyStars; i++) {
			stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
		}

		return stars;
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-8 mb-8">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex-shrink-0">
					<div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gray-200 mx-auto lg:mx-0">
						{doctor.profilePicture ? (
							<img
								src={doctor.profilePicture}
								alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-blue-100">
								<User className="w-16 h-16 text-blue-600" />
							</div>
						)}
					</div>
				</div>

				<div className="flex-1">
					<div className="text-center lg:text-left">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Dr. {doctor.firstName} {doctor.lastName}
						</h1>
						<div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
							<Stethoscope className="w-5 h-5 text-blue-600" />
							<span className="text-xl text-blue-600 font-medium">
								{doctor.specialization}
							</span>
						</div>

						{doctor.averageRating > 0 && (
							<div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
								<div className="flex">{renderStars(doctor.averageRating)}</div>
								<span className="text-gray-600">
									({doctor.averageRating.toFixed(1)})
								</span>
							</div>
						)}

						{doctor.yearsOfExperience && (
							<div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
								<Award className="w-5 h-5 text-green-600" />
								<span className="text-gray-700">
									{doctor.yearsOfExperience} years of experience
								</span>
							</div>
						)}

						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							{doctor.phoneNumber && (
								<div className="flex items-center gap-2">
									<Phone className="w-4 h-4 text-gray-500" />
									<span className="text-gray-700">{doctor.phoneNumber}</span>
								</div>
							)}
							{doctor.consultationFee && (
								<div className="flex items-center gap-2">
									<span className="text-green-600 font-semibold">
										₹{doctor.consultationFee}
									</span>
									<span className="text-gray-500">consultation fee</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex-shrink-0"></div>
			</div>
		</div>
	);
};

export default DoctorHeader;
