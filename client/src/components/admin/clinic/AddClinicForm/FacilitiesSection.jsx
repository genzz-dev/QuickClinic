import React from "react";
import { Shield } from "lucide-react";

const FacilitiesSection = ({ facilities, handleFacilityToggle }) => {
	const availableFacilities = [
		"Parking",
		"Wheelchair Accessible",
		"Pharmacy",
		"Laboratory",
		"X-Ray",
		"Emergency Care",
		"Wi-Fi",
		"Air Conditioning",
		"Waiting Room",
	];

	return (
		<div className="bg-gray-50 rounded-lg p-6">
			<div className="flex items-center mb-4">
				<Shield className="h-5 w-5 text-blue-600 mr-2" />
				<h3 className="text-lg font-semibold text-gray-900">
					Facilities & Services
				</h3>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{availableFacilities.map((facility) => (
					<div key={facility} className="flex items-center">
						<input
							type="checkbox"
							id={facility}
							checked={facilities.includes(facility)}
							onChange={() => handleFacilityToggle(facility)}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label
							htmlFor={facility}
							className="ml-2 text-sm text-gray-700 cursor-pointer"
						>
							{facility}
						</label>
					</div>
				))}
			</div>
		</div>
	);
};

export default FacilitiesSection;
