import React from "react";

const ClinicFacilities = ({ facilities }) => {
	if (!facilities || facilities.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{facilities.slice(0, 3).map((facility, index) => (
				<span
					key={index}
					className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
				>
					{facility}
				</span>
			))}
			{facilities.length > 3 && (
				<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
					+{facilities.length - 3} more
				</span>
			)}
		</div>
	);
};

export default ClinicFacilities;
