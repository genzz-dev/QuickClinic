import { Link, MapPin } from "lucide-react";

const AddressSection = ({
	formData,
	addressMethod,
	setAddressMethod,
	handleInputChange,
	errors,
}) => {
	return (
		<div className="bg-gray-50 rounded-lg p-6">
			<div className="flex items-center mb-4">
				<MapPin className="h-5 w-5 text-blue-600 mr-2" />
				<h3 className="text-lg font-semibold text-gray-900">
					Address Information
				</h3>
			</div>

			{/* Address Method Toggle */}
			<div className="mb-6">
				<div className="flex space-x-4">
					<button
						type="button"
						onClick={() => setAddressMethod("manual")}
						className={`px-4 py-2 rounded-lg transition-colors ${
							addressMethod === "manual"
								? "bg-blue-600 text-white"
								: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
						}`}
					>
						Enter Manually
					</button>
					<button
						type="button"
						onClick={() => setAddressMethod("google")}
						className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
							addressMethod === "google"
								? "bg-blue-600 text-white"
								: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
						}`}
					>
						<Link className="h-4 w-4 mr-2" />
						Google Maps Link
					</button>
				</div>
			</div>

			{addressMethod === "manual" ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Address *
						</label>
						<textarea
							name="address.formattedAddress"
							value={formData.address.formattedAddress}
							onChange={handleInputChange}
							rows={3}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.address ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter complete address"
						/>
						{errors.address && (
							<p className="mt-1 text-sm text-red-600">{errors.address}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							City *
						</label>
						<input
							type="text"
							name="address.city"
							value={formData.address.city}
							onChange={handleInputChange}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.city ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter city"
						/>
						{errors.city && (
							<p className="mt-1 text-sm text-red-600">{errors.city}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							State *
						</label>
						<input
							type="text"
							name="address.state"
							value={formData.address.state}
							onChange={handleInputChange}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.state ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter state"
						/>
						{errors.state && (
							<p className="mt-1 text-sm text-red-600">{errors.state}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							ZIP Code *
						</label>
						<input
							type="text"
							name="address.zipCode"
							value={formData.address.zipCode}
							onChange={handleInputChange}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.zipCode ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter ZIP code"
						/>
						{errors.zipCode && (
							<p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Country
						</label>
						<input
							type="text"
							name="address.country"
							value={formData.address.country}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter country"
						/>
					</div>
				</div>
			) : (
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Google Maps Link *
					</label>
					<input
						type="url"
						name="googleMapsLink"
						value={formData.googleMapsLink}
						onChange={handleInputChange}
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
							errors.googleMapsLink ? "border-red-300" : "border-gray-300"
						}`}
						placeholder="Paste Google Maps link of your clinic"
					/>
					{errors.googleMapsLink && (
						<p className="mt-1 text-sm text-red-600">{errors.googleMapsLink}</p>
					)}
					<p className="mt-2 text-sm text-gray-500">
						Go to Google Maps, search for your clinic, and copy the URL from
						your browser
					</p>
				</div>
			)}
		</div>
	);
};

export default AddressSection;
