// components/ui/NotFoundPage.jsx

import { useNavigate } from "react-router-dom";

const NotFoundPage = ({
	title = "Page Under Review",
	message = "You’ve reached an unavailable section. Let's guide you back.",
	isUnauthorized = false,
}) => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate("/", { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
			<div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md w-full relative">
				{/* Icon */}
				<div className="text-6xl mb-6">{isUnauthorized ? "💊" : "🩺"}</div>

				{/* Error Code */}
				<div className="text-5xl font-bold text-indigo-600 mb-4">
					{isUnauthorized ? "403" : "404"}
				</div>

				{/* Title */}
				<h1 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h1>

				{/* Message */}
				<p className="text-gray-600 mb-6">{message}</p>

				{/* Quote */}
				<div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-6">
					<p className="text-blue-800 italic">
						{isUnauthorized
							? "Access restricted. Please check your credentials."
							: "This page is currently unavailable."}
					</p>
				</div>

				{/* Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<button
						onClick={handleGoHome}
						className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded transition"
					>
						🏠 Return Home
					</button>

					<button
						onClick={() => window.history.back()}
						className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded transition"
					>
						⬅️ Go Back
					</button>
				</div>

				{/* Fun Fact */}
				<div className="text-xs text-gray-500 italic mt-5">
					💡 Even doctors get lost sometimes!
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
