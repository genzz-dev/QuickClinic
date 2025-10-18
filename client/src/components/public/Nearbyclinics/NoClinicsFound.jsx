import { MapPin } from "lucide-react";

const NoClinicsFound = ({ onRefresh }) => {
	return (
		<div className="text-center py-12">
			<MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
			<h3 className="text-lg font-medium text-gray-900 mb-2">
				No clinics found in your area
			</h3>
			<p className="text-gray-600 mb-4">
				Try adjusting your location or search in a different area
			</p>
			<button
				onClick={onRefresh}
				className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Refresh
			</button>
		</div>
	);
};

export default NoClinicsFound;
