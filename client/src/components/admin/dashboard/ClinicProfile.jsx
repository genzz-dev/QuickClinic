import React from "react";
import { useNavigate } from "react-router-dom";
import {
	PhoneIcon,
	MapPinIcon,
	GlobeAltIcon,
	EnvelopeIcon,
	PhotoIcon,
	UserGroupIcon,
	CheckBadgeIcon,
	PencilSquareIcon,
	BuildingOfficeIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";

const Section = ({ title, cta, onCta, children }) => (
	<div className="border-b border-gray-100 last:border-b-0 py-6 first:pt-0 last:pb-0">
		<div className="flex items-center justify-between mb-4">
			<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
			{cta && (
				<button
					onClick={onCta}
					className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center space-x-1 transition-colors duration-200"
				>
					<span>{cta}</span>
					<PencilSquareIcon className="h-4 w-4" />
				</button>
			)}
		</div>
		{children}
	</div>
);

const ClinicProfile = ({ clinicData, doctors }) => {
	const navigate = useNavigate();

	if (!clinicData) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No Clinic Setup
					</h3>
					<p className="text-gray-600 mb-6">
						Create your clinic to start managing details.
					</p>
					<button
						onClick={() => navigate("/admin/update-clinic")}
						className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
					>
						Setup Clinic
					</button>
				</div>
			</div>
		);
	}

	// Extract data properly from your clinic data structure
	const {
		name,
		description,
		contact = {}, // Default to empty object if contact doesn't exist
		address,
		operatingHours,
		photos,
		facilities,
		gstNumber,
		gstName,
		googleMapsLink,
		isVerified,
	} = clinicData;

	// Extract contact details from the nested contact object
	const { phone, email, website } = contact;

	// Helper function to format address
	const formatAddress = (addressData) => {
		if (!addressData) return "Address not provided";

		// If address is a string, return it directly
		if (typeof addressData === "string") {
			return addressData;
		}

		// If address is an object, format it properly
		if (typeof addressData === "object") {
			const { formattedAddress, city, state, zipCode, country } = addressData;

			// Use formattedAddress if available
			if (formattedAddress) {
				return formattedAddress;
			}

			// Otherwise, construct from available parts
			const parts = [];
			if (city) parts.push(city);
			if (state) parts.push(state);
			if (zipCode) parts.push(zipCode);
			if (country) parts.push(country);

			return parts.length > 0 ? parts.join(", ") : "Address not provided";
		}

		return "Address not provided";
	};

	// Helper function to format facilities
	const formatFacilities = (facilitiesData) => {
		if (!facilitiesData || !Array.isArray(facilitiesData)) return [];

		// Handle case where facilities might be stored as stringified array
		return facilitiesData.filter((facility) => {
			// Remove any empty strings or invalid entries like '[]'
			return facility && facility !== "[]" && typeof facility === "string";
		});
	};

	const formattedFacilities = formatFacilities(facilities);

	return (
		<div className="p-6">
			{/* Clinic Basic Info */}
			<Section
				title="Clinic Information"
				cta="Edit Details"
				onCta={() => navigate("/admin/update-clinic")}
			>
				<div className="space-y-4">
					{/* Clinic Name & Description */}
					<div>
						<div className="flex items-center space-x-2 mb-2">
							<h2 className="text-2xl font-bold text-gray-900">
								{name || "Clinic Name Not Set"}
							</h2>
							{isVerified && (
								<CheckBadgeIcon
									className="h-6 w-6 text-green-500"
									title="Verified Clinic"
								/>
							)}
						</div>
						<p className="text-gray-600 leading-relaxed">
							{description || "Add a brief clinic description for patients."}
						</p>
					</div>

					{/* Contact Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
						<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
							<PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
							<span className="text-gray-900">{phone || "Not provided"}</span>
						</div>

						<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
							<EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
							<span className="text-gray-900">{email || "Not provided"}</span>
						</div>

						<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
							<MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
							<span className="text-gray-900">{formatAddress(address)}</span>
						</div>

						{website && (
							<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
								<GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
								<span className="text-gray-900">{website}</span>
							</div>
						)}

						{googleMapsLink && (
							<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
								<MapPinIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
								<a
									href={googleMapsLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-800 truncate"
								>
									View on Google Maps
								</a>
							</div>
						)}
					</div>
				</div>
			</Section>

			{/* Operating Hours */}
			<Section title="Operating Hours">
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex items-center space-x-2 text-gray-600">
						<ClockIcon className="h-5 w-5" />
						<span className="font-medium">Weekly Schedule</span>
					</div>
					<div className="mt-3 space-y-2">
						{operatingHours ? (
							Object.entries(operatingHours).map(([day, hours]) => (
								<div
									key={day}
									className="flex justify-between items-center text-sm"
								>
									<span className="font-medium text-gray-900 capitalize">
										{day}
									</span>
									<span className="text-gray-600">
										{hours.isOpen
											? `${hours.openTime} - ${hours.closeTime}`
											: "Closed"}
									</span>
								</div>
							))
						) : (
							<p className="text-gray-500 text-sm">No schedule set</p>
						)}
					</div>
				</div>
			</Section>

			{/* Photos Section */}
			<Section
				title="Clinic Photos"
				cta="Manage Photos"
				onCta={() => navigate("/admin/update-clinic")}
			>
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex items-center space-x-2 text-gray-600 mb-3">
						<PhotoIcon className="h-5 w-5" />
						<span className="font-medium">Gallery</span>
					</div>

					{photos && photos.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{photos.map((photo, index) => (
								<div key={index} className="relative">
									<img
										src={photo.url}
										alt={photo.caption || `Clinic photo ${index + 1}`}
										className="w-full h-24 object-cover rounded-lg border border-gray-200"
									/>
									{photo.caption && (
										<p className="text-xs text-gray-600 mt-1 truncate">
											{photo.caption}
										</p>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<PhotoIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
							<p className="text-gray-500 text-sm">
								No photos yet. Add photos to showcase your clinic.
							</p>
						</div>
					)}
				</div>
			</Section>

			{/* Doctors Section */}
			<Section
				title="Doctors"
				cta="Manage Doctors"
				onCta={() => navigate("/admin/doctors")}
			>
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex items-center space-x-2 text-gray-600 mb-3">
						<UserGroupIcon className="h-5 w-5" />
						<span className="font-medium">Medical Staff</span>
					</div>

					{doctors && doctors.length > 0 ? (
						<div className="space-y-3">
							{doctors.map((doctor, index) => (
								<div
									key={index}
									className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
								>
									<div className="flex-shrink-0">
										{doctor.profileImage ? (
											<img
												src={doctor.profileImage}
												alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
												<UserGroupIcon className="h-5 w-5 text-gray-500" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900">
											Dr. {doctor.firstName} {doctor.lastName}
										</p>
										<p className="text-sm text-gray-500">
											{doctor.specialization || "General Practice"}
										</p>
									</div>
									{doctor.isVerified && (
										<CheckBadgeIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
							<p className="text-gray-500 text-sm">No doctors added yet.</p>
						</div>
					)}
				</div>
			</Section>

			{/* Facilities Section */}
			<Section
				title="Facilities & Services"
				cta="Update Facilities"
				onCta={() => navigate("/admin/update-clinic")}
			>
				<div className="bg-gray-50 rounded-lg p-4">
					{formattedFacilities.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{formattedFacilities.map((facility, index) => (
								<div
									key={index}
									className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200"
								>
									<CheckBadgeIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
									<span className="text-sm text-gray-700">{facility}</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
							<p className="text-gray-500 text-sm">
								No facilities listed. Add facilities to improve discovery.
							</p>
						</div>
					)}
				</div>
			</Section>

			{/* GST Information */}
			<Section
				title="GST Information"
				cta="Update GST"
				onCta={() => navigate("/admin/update-clinic")}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							GST Number
						</h4>
						<p className="text-gray-900">{gstNumber || "Not added"}</p>
					</div>
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">GST Name</h4>
						<p className="text-gray-900">{gstName || "Not added"}</p>
					</div>
				</div>
			</Section>
		</div>
	);
};

export default ClinicProfile;
