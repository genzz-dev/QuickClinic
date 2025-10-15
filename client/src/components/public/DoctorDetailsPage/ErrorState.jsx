import React from "react";
import { User } from "lucide-react";

const ErrorState = ({ error }) => (
	<div className="min-h-screen bg-gray-50 flex items-center justify-center">
		<div className="text-center">
			<div className="text-red-500 mb-4">
				<User className="w-16 h-16 mx-auto mb-2" />
			</div>
			<h2 className="text-xl font-semibold text-gray-800 mb-2">
				Something went wrong
			</h2>
			<p className="text-gray-600">{error}</p>
		</div>
	</div>
);

export default ErrorState;
