import React from "react";
import {
	Building,
	MapPin,
	Phone,
	Mail,
	ChevronRight,
	CheckCircle,
	XCircle,
} from "lucide-react";

const ClinicInfoSection = ({ clinic, handleClinicClick }) =>
	clinic && (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<Building className="w-5 h-5 text-indigo-600" />
				Clinic Information
			</h2>

			<div
				className="cursor-pointer group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
				onClick={handleClinicClick}
			>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
								{clinic.name}
							</h3>
							{console.log(clinic)}
							{/* Verification Badge */}
							<div
								className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${clinic.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
							>
								{clinic.isVerified ? (
									<>
										<CheckCircle className="w-4 h-4" />
										<span>Verified</span>
									</>
								) : (
									<>
										<XCircle className="w-4 h-4" />
										<span>Not Verified</span>
									</>
								)}
							</div>
						</div>

						{clinic.address && (
							<div className="flex items-start gap-2 mb-3">
								<MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
								<span className="text-gray-600 text-sm leading-relaxed">
									{clinic.address.formattedAddress}
								</span>
							</div>
						)}

						{clinic.contact && (
							<div className="space-y-2">
								{clinic.contact.phone && (
									<div className="flex items-center gap-2">
										<Phone className="w-4 h-4 text-gray-500" />
										<span className="text-gray-600 text-sm">
											{clinic.contact.phone}
										</span>
									</div>
								)}
								{clinic.contact.email && (
									<div className="flex items-center gap-2">
										<Mail className="w-4 h-4 text-gray-500" />
										<span className="text-gray-600 text-sm">
											{clinic.contact.email}
										</span>
									</div>
								)}
							</div>
						)}

						{clinic.facilities && clinic.facilities.length > 0 && (
							<div className="mt-3">
								<p className="text-sm text-gray-500 mb-2">Facilities:</p>
								<div className="flex flex-wrap gap-1">
									{clinic.facilities.slice(0, 3).map((facility, index) => (
										<span
											key={index}
											className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
										>
											{facility}
										</span>
									))}
									{clinic.facilities.length > 3 && (
										<span className="text-xs text-gray-500">
											+{clinic.facilities.length - 3} more
										</span>
									)}
								</div>
							</div>
						)}
					</div>

					<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
				</div>
			</div>
		</div>
	);

export default ClinicInfoSection;
