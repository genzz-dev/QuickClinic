import React from "react";

const ClinicImage = ({ clinic }) => {
	return (
		<div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
			{clinic.logo ? (
				<img
					src={clinic.logo}
					alt={clinic.name}
					className="h-full w-full object-cover rounded-t-lg"
				/>
			) : (
				<div className="text-white text-4xl font-bold">
					{clinic.name.charAt(0)}
				</div>
			)}
		</div>
	);
};

export default ClinicImage;
