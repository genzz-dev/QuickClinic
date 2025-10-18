import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	getDoctorProfile,
	updateDoctorProfile,
} from "../../service/doctorApiService";

function DoctorShareIdPage() {
	const [doctorProfile, setDoctorProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(true);
	const [updateLoading, setUpdateLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		fetchDoctorProfile();
	}, []);

	const fetchDoctorProfile = async () => {
		try {
			setLoading(true);
			const response = await getDoctorProfile();
			const data = response;
			setDoctorProfile(data);
			setFormData({
				firstName: data?.firstName || "",
				lastName: data?.lastName || "",
				phoneNumber: data?.phoneNumber || "",
				specialization: data?.specialization || "",
				yearsOfExperience: data?.yearsOfExperience || "",
				bio: data?.bio || "",
				qualifications: Array.isArray(data?.qualifications)
					? data.qualifications.join(", ")
					: "",
				consultationFee: data?.consultationFee || "",
			});
		} catch (error) {
			setMessage({ type: "error", text: "Failed to load profile" });
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdateLoading(true);

		// Convert qualifications string to array
		const updateBody = {
			...formData,
			qualifications: formData.qualifications
				.split(",")
				.map((q) => q.trim())
				.filter((q) => q),
		};

		try {
			await updateDoctorProfile(updateBody);
			setMessage({ type: "success", text: "Profile updated successfully!" });
			setIsEditing(false);
			await fetchDoctorProfile();
		} catch (error) {
			setMessage({
				type: "error",
				text: error.response?.data?.message || "Failed to update profile",
			});
		} finally {
			setUpdateLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(doctorProfile._id);
		setMessage({ type: "success", text: "Doctor ID copied to clipboard!" });
		setTimeout(() => setMessage({ type: "", text: "" }), 3000);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-10">
				<div className="mx-auto">
					{/* Title & Welcome */}
					<div className="text-center mb-8">
						<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
							Welcome, Dr. {doctorProfile?.firstName} {doctorProfile?.lastName}
						</h1>
						<p className="text-lg text-gray-600">
							Your profile is set up. Share your Doctor ID with clinic admins to
							join their clinic.
						</p>
					</div>

					{/* Doctor ID Card */}
					<div className="bg-white rounded-xl shadow-lg p-8 mb-10 flex flex-col items-center">
						<h2 className="text-2xl font-semibold text-gray-800 mb-3">
							Your Doctor ID
						</h2>
						<div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl px-7 py-5 mb-3 text-center">
							<span className="block text-3xl md:text-4xl font-mono font-bold tracking-wider break-all">
								{doctorProfile?._id}
							</span>
						</div>
						<button
							onClick={copyToClipboard}
							className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded transition"
						>
							📋 Copy Doctor ID
						</button>
					</div>

					{/* Security Note */}
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
						<span className="text-red-600 text-2xl mr-4">🔒</span>
						<div>
							<span className="font-semibold text-red-700">Security Tip:</span>
							<span className="text-red-700">
								{" "}
								Share your Doctor ID only with trusted clinic admins. Don't post
								this ID publicly.
							</span>
						</div>
					</div>

					{/* Step Instructions */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<h3 className="text-blue-800 font-semibold mb-2">
							How to join a clinic:
						</h3>
						<ul className="list-decimal list-inside text-blue-700 space-y-1 ml-2">
							<li>Contact clinic admin and share your Doctor ID securely.</li>
							<li>
								The admin will add you to their clinic from the dashboard.
							</li>
							<li>
								Once added, you will gain access to the clinic's features.
							</li>
						</ul>
					</div>

					{/* Profile Details & Edit */}
					<div className="bg-white rounded-xl shadow p-8 mb-8">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-800">
								Profile Details
							</h2>
							<button
								onClick={() => setIsEditing(!isEditing)}
								className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition"
							>
								{isEditing ? "Cancel Edit" : "Edit Profile"}
							</button>
						</div>

						{message.text && (
							<div
								className={`p-4 rounded mb-5 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
							>
								{message.text}
							</div>
						)}

						{isEditing ? (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											First Name
										</label>
										<input
											type="text"
											name="firstName"
											value={formData.firstName}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Last Name
										</label>
										<input
											type="text"
											name="lastName"
											value={formData.lastName}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Phone Number
										</label>
										<input
											type="tel"
											name="phoneNumber"
											value={formData.phoneNumber}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Specialization
										</label>
										<input
											type="text"
											name="specialization"
											value={formData.specialization}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Years of Experience
										</label>
										<input
											type="number"
											min="0"
											name="yearsOfExperience"
											value={formData.yearsOfExperience}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Consultation Fee (₹)
										</label>
										<input
											type="number"
											min="0"
											name="consultationFee"
											value={formData.consultationFee}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											required
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Qualifications
										</label>
										<input
											type="text"
											name="qualifications"
											value={formData.qualifications}
											onChange={handleInputChange}
											placeholder="Comma separated e.g. MBBS, MD"
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-semibold text-gray-700 mb-1">
											Bio
										</label>
										<textarea
											name="bio"
											value={formData.bio}
											onChange={handleInputChange}
											rows="3"
											className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500"
											placeholder="Tell us about yourself..."
										/>
									</div>
								</div>
								<div className="flex items-center gap-4 pt-2">
									<button
										type="submit"
										disabled={updateLoading}
										className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded transition"
									>
										{updateLoading ? "⏳ Saving..." : "💾 Save Changes"}
									</button>
									<button
										type="button"
										onClick={() => setIsEditing(false)}
										className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded transition"
									>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								<div>
									<span className="font-semibold text-gray-700">
										Full Name:
									</span>
									<div className="text-gray-900">
										{doctorProfile?.firstName} {doctorProfile?.lastName}
									</div>
								</div>
								<div>
									<span className="font-semibold text-gray-700">
										Phone Number:
									</span>
									<div className="text-gray-900">
										{doctorProfile?.phoneNumber}
									</div>
								</div>
								<div>
									<span className="font-semibold text-gray-700">
										Specialization:
									</span>
									<div className="text-gray-900">
										{doctorProfile?.specialization}
									</div>
								</div>
								<div>
									<span className="font-semibold text-gray-700">
										Experience:
									</span>
									<div className="text-gray-900">
										{doctorProfile?.yearsOfExperience} years
									</div>
								</div>
								<div>
									<span className="font-semibold text-gray-700">
										Consultation Fee:
									</span>
									<div className="text-gray-900">
										₹{doctorProfile?.consultationFee}
									</div>
								</div>
								<div>
									<span className="font-semibold text-gray-700">
										Qualifications:
									</span>
									<div className="text-gray-900">
										{doctorProfile?.qualifications?.join(", ")}
									</div>
								</div>
								{doctorProfile?.bio && (
									<div className="md:col-span-2">
										<span className="font-semibold text-gray-700">Bio:</span>
										<div className="text-gray-900">{doctorProfile.bio}</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default DoctorShareIdPage;
