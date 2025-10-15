// components/NearbyClinicsList.jsx
import { Shield, Building2, MapPin, Phone, Users } from "lucide-react";

const NearbyClinicsList = ({ clinics, navigate }) => {
	return (
		<section className="py-16 bg-gray-50">
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="text-center space-y-4 mb-12">
					<h2 className="text-3xl font-bold text-gray-900">
						Verified Medical Facilities
					</h2>
					<p className="text-gray-600">
						Trusted healthcare clinics in your area
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{clinics.map((clinic) => (
						<div
							key={clinic._id}
							onClick={() => navigate(`/clinic/${clinic._id}`)}
							className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
						>
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
										<Building2 className="w-6 h-6 text-gray-600" />
									</div>
									{clinic.isVerified && (
										<div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
											<Shield className="w-3 h-3" />
											<span>Verified</span>
										</div>
									)}
								</div>

								<h3 className="font-semibold text-gray-900 mb-3">
									{clinic.name}
								</h3>

								<div className="space-y-2 text-sm text-gray-600 mb-4">
									{clinic.address && (
										<div className="flex items-start space-x-2">
											<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
											<span className="line-clamp-2">
												{clinic.address.street}, {clinic.address.city},{" "}
												{clinic.address.state}
											</span>
										</div>
									)}

									{clinic.contact?.phone && (
										<div className="flex items-center space-x-2">
											<Phone className="w-4 h-4" />
											<span>{clinic.contact.phone}</span>
										</div>
									)}

									{clinic.doctors && (
										<div className="flex items-center space-x-2">
											<Users className="w-4 h-4" />
											<span>
												{clinic.doctors.length} Doctor
												{clinic.doctors.length !== 1 ? "s" : ""}
											</span>
										</div>
									)}
								</div>

								{clinic.facilities && clinic.facilities.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{clinic.facilities.slice(0, 2).map((facility, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
											>
												{facility}
											</span>
										))}
										{clinic.facilities.length > 2 && (
											<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
												+{clinic.facilities.length - 2}
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="text-center mt-12">
					<button
						onClick={() => navigate("/search?type=clinics")}
						className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						View All Clinics
					</button>
				</div>
			</div>
		</section>
	);
};

export default NearbyClinicsList;
