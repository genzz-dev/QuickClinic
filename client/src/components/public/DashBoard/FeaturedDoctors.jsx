// components/FeaturedDoctors.jsx
import { Star, CheckCircle, Activity } from "lucide-react";

const FeaturedDoctors = ({ doctors, navigate }) => {
	return (
		<section className="py-16 bg-white">
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="text-center space-y-4 mb-12">
					<h2 className="text-3xl font-bold text-gray-900">
						Featured Healthcare Professionals
					</h2>
					<p className="text-gray-600">
						Experienced and verified medical practitioners
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{doctors.map((doctor) => (
						<div
							key={doctor._id}
							onClick={() => navigate(`/doctor/${doctor._id}`)}
							className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6"
						>
							<div className="flex flex-col items-center text-center space-y-4">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
									{doctor.profilePicture ? (
										<img
											src={doctor.profilePicture}
											alt={`${doctor.firstName} ${doctor.lastName}`}
											className="w-full h-full object-cover rounded-full"
										/>
									) : (
										<span>
											{doctor.firstName?.[0]}
											{doctor.lastName?.[0]}
										</span>
									)}
								</div>

								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900">
										Dr. {doctor.firstName} {doctor.lastName}
									</h3>
									<p className="text-blue-600 text-sm font-medium">
										{doctor.specialization}
									</p>

									<div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
										<div className="flex items-center space-x-1">
											<Star className="w-4 h-4 text-yellow-500 fill-current" />
											<span>{doctor.averageRating || "New"}</span>
										</div>
										<span className="text-gray-300">•</span>
										<span>{doctor.yearsOfExperience}+ years</span>
									</div>
								</div>

								<div className="w-full flex items-center justify-between pt-2">
									<div className="text-lg font-semibold text-gray-900">
										₹{doctor.consultationFee}
									</div>
									<div className="flex items-center space-x-2">
										{doctor.isVerified && (
											<CheckCircle className="w-4 h-4 text-green-600" />
										)}
										{doctor.availableForTeleconsultation && (
											<Activity className="w-4 h-4 text-blue-600" />
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="text-center mt-12">
					<button
						onClick={() => navigate("/search?type=doctors")}
						className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						View All Doctors
					</button>
				</div>
			</div>
		</section>
	);
};

export default FeaturedDoctors;
