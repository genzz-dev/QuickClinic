import React from "react";
import { Phone, Mail } from "lucide-react";

const ContactSection = ({ formData, handleInputChange, errors }) => {
	return (
		<div className="bg-gray-50 rounded-lg p-6">
			<div className="flex items-center mb-4">
				<Phone className="h-5 w-5 text-blue-600 mr-2" />
				<h3 className="text-lg font-semibold text-gray-900">
					Contact Information
				</h3>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Phone Number *
					</label>
					<input
						type="tel"
						name="contact.phone"
						value={formData.contact.phone}
						onChange={handleInputChange}
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
							errors.phone ? "border-red-300" : "border-gray-300"
						}`}
						placeholder="Enter phone number"
					/>
					{errors.phone && (
						<p className="mt-1 text-sm text-red-600">{errors.phone}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Email Address *
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
						<input
							type="email"
							name="contact.email"
							value={formData.contact.email}
							onChange={handleInputChange}
							className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.email ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter email address"
						/>
					</div>
					{errors.email && (
						<p className="mt-1 text-sm text-red-600">{errors.email}</p>
					)}
				</div>

				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Website (Optional)
					</label>
					<input
						type="url"
						name="contact.website"
						value={formData.contact.website}
						onChange={handleInputChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Enter website URL"
					/>
				</div>
			</div>
		</div>
	);
};

export default ContactSection;
