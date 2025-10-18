import {
	Building,
	CheckCircle,
	Globe,
	Mail,
	MapPin,
	Phone,
} from "lucide-react";

const ClinicHeader = ({ clinic }) => {
	const { name, logo, description, address, contact, isVerified } = clinic;

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			{/* Logo Section */}
			<div className="flex-shrink-0">
				{logo ? (
					<img
						src={logo}
						alt={`${name ?? "Clinic"} logo`}
						className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
					/>
				) : (
					<div
						className="w-24 h-24 rounded-lg bg-blue-100 flex items-center justify-center"
						aria-label="Clinic logo placeholder"
					>
						<Building className="w-12 h-12 text-blue-600" />
					</div>
				)}
			</div>

			{/* Main Info Section */}
			<div className="flex-1">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>

				{description && <p className="text-gray-600 mb-4">{description}</p>}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Address */}
					<div className="flex items-start gap-3">
						<MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
						<div>
							<p className="text-gray-900 font-medium">Address</p>
							<p className="text-gray-600">{address?.formattedAddress}</p>
							<p className="text-gray-600">
								{address?.city}, {address?.state} {address?.zipCode}
							</p>
							<p className="text-gray-600">{address?.country}</p>
						</div>
					</div>

					{/* Contact Info */}
					<div className="space-y-2">
						{contact?.phone && (
							<div className="flex items-center gap-3">
								<Phone className="w-5 h-5 text-gray-400" />
								<span className="text-gray-900">{contact.phone}</span>
							</div>
						)}
						{contact?.email && (
							<div className="flex items-center gap-3">
								<Mail className="w-5 h-5 text-gray-400" />
								<span className="text-gray-900">{contact.email}</span>
							</div>
						)}
						{contact?.website && (
							<div className="flex items-center gap-3">
								<Globe className="w-5 h-5 text-gray-400" />
								<a
									href={contact.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-800 break-words"
								>
									{contact.website}
								</a>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Business Info Panel */}
			<div className="bg-white rounded-lg shadow-sm p-6 lg:w-64 flex-shrink-0">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Business Information
				</h2>

				{/* Verification */}
				<div className="mb-4">
					<h3 className="text-sm font-medium text-gray-500 mb-1">
						Verification Status
					</h3>
					<div className="flex items-center gap-2">
						{isVerified ? (
							<>
								<CheckCircle className="w-4 h-4 text-green-500" />
								<span className="text-green-700 font-medium">
									Verified Clinic
								</span>
							</>
						) : (
							<span className="text-red-500 font-medium">Not Verified</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ClinicHeader;
