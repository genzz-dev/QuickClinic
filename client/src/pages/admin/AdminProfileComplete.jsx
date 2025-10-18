import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import { createAdminProfile } from "../../service/adminApiService";

export default function AdminProfileComplete() {
	const navigate = useNavigate();

	const [fields, setFields] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		profilePicture: null,
	});
	const [profilePreview, setProfilePreview] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "profilePicture" && files && files[0]) {
			setFields((f) => ({
				...f,
				profilePicture: files[0],
			}));
			setProfilePreview(URL.createObjectURL(files[0]));
		} else {
			setFields((f) => ({
				...f,
				[name]: value,
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { firstName, lastName, phone, profilePicture } = fields;
			if (!firstName || !lastName || !phone) {
				setError("Please fill out all fields");
				setLoading(false);
				return;
			}
			const profileData = { firstName, lastName, phone };
			await createAdminProfile(profileData, profilePicture);
			navigate("/admin/add-clinic", { replace: true });
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to complete profile");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-100/70 via-white to-indigo-100/80 px-4">
			<div className="w-full max-w-xl rounded-2xl bg-white px-10 py-10 shadow-2xl border border-gray-100">
				<h1 className="mb-1 text-3xl font-bold text-indigo-700 text-center">
					Admin Profile Setup
				</h1>
				<p className="mb-8 text-gray-600 text-center text-sm">
					Please complete your profile to proceed. It helps us secure your
					account.
				</p>
				<form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="firstName"
							>
								First Name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								value={fields.firstName}
								onChange={handleChange}
								required
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
								placeholder="Enter your first name"
								autoFocus
							/>
						</div>
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="lastName"
							>
								Last Name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								value={fields.lastName}
								onChange={handleChange}
								required
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
								placeholder="Enter your last name"
							/>
						</div>
					</div>
					<div>
						<label
							className="block text-sm font-medium text-gray-700 mb-1"
							htmlFor="phone"
						>
							Mobile Number
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={fields.phone}
							onChange={handleChange}
							required
							maxLength={15}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
							placeholder="e.g. +91 9876543210"
						/>
					</div>
					<div>
						<label
							className="block text-sm font-medium text-gray-700 mb-1"
							htmlFor="profilePicture"
						>
							Profile Picture <span className="text-gray-400">(optional)</span>
						</label>
						<input
							id="profilePicture"
							name="profilePicture"
							type="file"
							accept="image/*"
							onChange={handleChange}
							className="text-gray-700"
						/>
						{profilePreview && (
							<div className="mt-2 flex items-center">
								<img
									src={profilePreview}
									alt="Profile preview"
									className="w-16 h-16 rounded-full object-cover border"
								/>
								<button
									type="button"
									onClick={() => {
										setFields((f) => ({ ...f, profilePicture: null }));
										setProfilePreview(null);
									}}
									className="ml-4 text-xs text-red-500 hover:underline transition"
								>
									Remove
								</button>
							</div>
						)}
					</div>
					{error && (
						<div className="rounded bg-red-50 px-4 py-2 text-red-700 border border-red-200 mb-2 text-sm text-center">
							{error}
						</div>
					)}
					<button
						type="submit"
						disabled={loading}
						className={`w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-white font-semibold shadow hover:from-indigo-700 hover:to-violet-600 transition ${
							loading ? "opacity-70 pointer-events-none" : ""
						}`}
					>
						{loading ? <Loading /> : "Save & Continue"}
					</button>
				</form>
			</div>
		</div>
	);
}
