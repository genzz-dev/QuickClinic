import { MapPin } from "lucide-react";

const ErrorState = ({ error, onRetry }) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
				<p className="text-gray-600 mb-4">{error}</p>
				<button
					onClick={onRetry}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Retry
				</button>
			</div>
		</div>
	);
};

export default ErrorState;
