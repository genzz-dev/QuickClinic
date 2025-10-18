import { Award, CheckCircle, User, Video } from "lucide-react";
import StarRating from "../StarRating";

const DoctorCard = ({ doctor, onClick }) => {
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
		<div
			onClick={onClick}
			className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
		>
			<div className="flex items-start gap-4">
				{doctor.profilePicture ? (
					<img
						src={doctor.profilePicture}
						alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
						className="w-16 h-16 rounded-full object-cover"
					/>
				) : (
					<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
						<User className="w-8 h-8 text-gray-400" />
					</div>
				)}

				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 text-lg">
						Dr. {doctor.firstName} {doctor.lastName}
					</h3>
					{console.log("doctor is ", doctor._id)}
					<StarRating
						type="doctor"
						id={doctor._id}
						size="small"
						inline={true}
					/>
					<p className="text-blue-600 font-medium">{doctor.specialization}</p>

					{doctor.bio && (
						<p className="text-gray-600 text-sm mt-1 line-clamp-2">
							{doctor.bio}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
						{doctor.yearsOfExperience && (
							<div className="flex items-center gap-1">
								<Award className="w-4 h-4 text-gray-400" />
								<span className="text-gray-600">
									{doctor.yearsOfExperience} years exp.
								</span>
							</div>
						)}

						{doctor.averageRating > 0 && (
							<div className="flex items-center gap-1">
								<div className="flex">{renderStars(doctor.averageRating)}</div>
								<span className="text-gray-600">
									({doctor.averageRating.toFixed(1)})
								</span>
							</div>
						)}

						{doctor.consultationFee && (
							<div className="flex items-center gap-1">
								<span className="text-gray-600">₹{doctor.consultationFee}</span>
							</div>
						)}

						{doctor.availableForTeleconsultation && (
							<div className="flex items-center gap-1">
								<Video className="w-4 h-4 text-green-500" />
								<span className="text-green-600">Video consultation</span>
							</div>
						)}
					</div>

					{doctor.qualifications && doctor.qualifications.length > 0 && (
						<div className="mt-2">
							<div className="flex flex-wrap gap-1">
								{doctor.qualifications.map((qualification, index) => (
									<span
										key={index}
										className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
									>
										{qualification}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DoctorCard;
