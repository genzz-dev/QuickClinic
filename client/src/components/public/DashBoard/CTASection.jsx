// components/CTASection.jsx
import { Stethoscope, Users } from "lucide-react";

const CTASection = ({ navigate }) => {
	return (
		<section className="py-16 bg-gray-900">
			<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
				<h2 className="text-3xl font-bold text-white mb-4">
					Get Started with QuickClinic
				</h2>
				<p className="text-gray-300 mb-8">
					Join our network of healthcare professionals and patients
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onClick={() => navigate("/register")}
						className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
					>
						<Users className="w-5 h-5 mr-2" />
						Register as Patient
					</button>
					<button
						onClick={() => navigate("/register")}
						className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
					>
						<Stethoscope className="w-5 h-5 mr-2" />
						Join as Provider
					</button>
				</div>
			</div>
		</section>
	);
};

export default CTASection;
