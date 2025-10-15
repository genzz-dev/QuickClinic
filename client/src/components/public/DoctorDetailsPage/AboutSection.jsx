import React from "react";
import { BookOpen } from "lucide-react";

const AboutSection = ({ doctor }) => (
	<div className="bg-white rounded-lg shadow-lg p-6">
		<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
			<BookOpen className="w-5 h-5 text-blue-600" />
			About Dr. {doctor.firstName} {doctor.lastName}
		</h2>
		{doctor.bio ? (
			<p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
		) : (
			<p className="text-gray-500 italic">No bio available</p>
		)}
	</div>
);

export default AboutSection;
