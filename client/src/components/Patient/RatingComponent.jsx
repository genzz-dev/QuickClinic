import { Building2, Check, Edit2, Star, Trash2, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
	createRating,
	deleteRating,
	getClinicRatings,
	getDoctorRatings,
	updateRating,
} from "../../service/ratingApiService";

const RatingComponent = ({
	appointmentId,
	doctorId,
	clinicId,
	onRatingUpdate,
}) => {
	const [doctorRating, setDoctorRating] = useState(null);
	const [clinicRating, setClinicRating] = useState(null);
	const [editingDoctor, setEditingDoctor] = useState(false);
	const [editingClinic, setEditingClinic] = useState(false);

	// Form states for doctor rating
	const [doctorFormData, setDoctorFormData] = useState({
		rating: 0,
		comment: "",
	});

	// Form states for clinic rating
	const [clinicFormData, setClinicFormData] = useState({
		rating: 0,
		comment: "",
	});

	const [hoveredDoctorStar, setHoveredDoctorStar] = useState(0);
	const [hoveredClinicStar, setHoveredClinicStar] = useState(0);
	const [loading, setLoading] = useState({ doctor: false, clinic: false });
	const [error, setError] = useState({ doctor: null, clinic: null });
	const [success, setSuccess] = useState({ doctor: null, clinic: null });

	useEffect(() => {
		fetchExistingRatings();
	}, [appointmentId, doctorId, clinicId]);

	const fetchExistingRatings = async () => {
		try {
			// Fetch doctor ratings
			if (doctorId) {
				const doctorRatingsResponse = await getDoctorRatings(doctorId);
				const doctorRatings =
					doctorRatingsResponse.ratings || doctorRatingsResponse.data || [];
				const existingDoctorRating = doctorRatings.find(
					(r) =>
						(r.appointmentId?._id === appointmentId ||
							r.appointmentId === appointmentId) &&
						r.ratingType === "doctor",
				);

				if (existingDoctorRating) {
					setDoctorRating(existingDoctorRating);
					setDoctorFormData({
						rating: existingDoctorRating.rating || 0,
						comment: existingDoctorRating.comment || "",
					});
				}
			}

			// Fetch clinic ratings
			if (clinicId) {
				const clinicRatingsResponse = await getClinicRatings(clinicId);
				const clinicRatings =
					clinicRatingsResponse.ratings || clinicRatingsResponse.data || [];
				const existingClinicRating = clinicRatings.find(
					(r) =>
						(r.appointmentId?._id === appointmentId ||
							r.appointmentId === appointmentId) &&
						r.ratingType === "clinic",
				);

				if (existingClinicRating) {
					setClinicRating(existingClinicRating);
					setClinicFormData({
						rating: existingClinicRating.rating || 0,
						comment: existingClinicRating.comment || "",
					});
				}
			}
		} catch (err) {
			console.log("Error fetching existing ratings:", err);
		}
	};

	const handleSubmitRating = async (type) => {
		const isDoctor = type === "doctor";
		const formData = isDoctor ? doctorFormData : clinicFormData;
		const existingRating = isDoctor ? doctorRating : clinicRating;

		if (formData.rating === 0) {
			setError((prev) => ({
				...prev,
				[type]: `Please provide a ${type} rating`,
			}));
			return;
		}

		try {
			setLoading((prev) => ({ ...prev, [type]: true }));
			setError((prev) => ({ ...prev, [type]: null }));
			setSuccess((prev) => ({ ...prev, [type]: null }));

			const ratingData = {
				appointmentId,
				rating: formData.rating,
				comment: formData.comment.trim(),
				ratingType: type,
				doctorId: isDoctor ? doctorId : undefined,
				clinicId: !isDoctor ? clinicId : undefined,
			};

			let response;
			if (existingRating && existingRating._id) {
				// Update existing rating
				response = await updateRating(existingRating._id, ratingData);
				setSuccess((prev) => ({
					...prev,
					[type]: `${type.charAt(0).toUpperCase() + type.slice(1)} rating updated successfully!`,
				}));
			} else {
				// Create new rating
				response = await createRating(ratingData);
				setSuccess((prev) => ({
					...prev,
					[type]: `${type.charAt(0).toUpperCase() + type.slice(1)} rating submitted successfully!`,
				}));
			}

			const newRating = response.rating || response.data;

			if (isDoctor) {
				setDoctorRating(newRating);
				setEditingDoctor(false);
			} else {
				setClinicRating(newRating);
				setEditingClinic(false);
			}

			if (onRatingUpdate) {
				onRatingUpdate(type, newRating);
			}

			setTimeout(() => {
				setSuccess((prev) => ({ ...prev, [type]: null }));
			}, 3000);
		} catch (err) {
			setError((prev) => ({
				...prev,
				[type]:
					err.response?.data?.message || `Failed to submit ${type} rating`,
			}));
			console.error(`${type} rating submission error:`, err);
		} finally {
			setLoading((prev) => ({ ...prev, [type]: false }));
		}
	};

	const handleDeleteRating = async (type) => {
		const rating = type === "doctor" ? doctorRating : clinicRating;

		if (
			!window.confirm(`Are you sure you want to delete this ${type} rating?`)
		) {
			return;
		}

		try {
			setLoading((prev) => ({ ...prev, [type]: true }));
			setError((prev) => ({ ...prev, [type]: null }));

			await deleteRating(rating._id);

			if (type === "doctor") {
				setDoctorRating(null);
				setDoctorFormData({ rating: 0, comment: "" });
				setEditingDoctor(true);
			} else {
				setClinicRating(null);
				setClinicFormData({ rating: 0, comment: "" });
				setEditingClinic(true);
			}

			setSuccess((prev) => ({
				...prev,
				[type]: `${type.charAt(0).toUpperCase() + type.slice(1)} rating deleted successfully!`,
			}));

			if (onRatingUpdate) {
				onRatingUpdate(type, null);
			}

			setTimeout(() => {
				setSuccess((prev) => ({ ...prev, [type]: null }));
			}, 3000);
		} catch (err) {
			setError((prev) => ({
				...prev,
				[type]:
					err.response?.data?.message || `Failed to delete ${type} rating`,
			}));
			console.error(`${type} rating deletion error:`, err);
		} finally {
			setLoading((prev) => ({ ...prev, [type]: false }));
		}
	};

	const handleCancel = (type) => {
		const existingRating = type === "doctor" ? doctorRating : clinicRating;

		if (existingRating) {
			if (type === "doctor") {
				setDoctorFormData({
					rating: existingRating.rating || 0,
					comment: existingRating.comment || "",
				});
				setEditingDoctor(false);
			} else {
				setClinicFormData({
					rating: existingRating.rating || 0,
					comment: existingRating.comment || "",
				});
				setEditingClinic(false);
			}
		} else {
			if (type === "doctor") {
				setDoctorFormData({ rating: 0, comment: "" });
			} else {
				setClinicFormData({ rating: 0, comment: "" });
			}
		}

		setError((prev) => ({ ...prev, [type]: null }));
	};

	const renderStars = (value, hoveredValue, onHover, onClick, isEditing) => {
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						size={24}
						className={`transition-colors ${
							isEditing ? "cursor-pointer" : "cursor-default"
						} ${
							star <= (hoveredValue || value)
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300"
						}`}
						onMouseEnter={() => isEditing && onHover && onHover(star)}
						onMouseLeave={() => isEditing && onHover && onHover(0)}
						onClick={() => isEditing && onClick && onClick(star)}
					/>
				))}
			</div>
		);
	};

	const renderRatingSection = (type) => {
		const isDoctor = type === "doctor";
		const rating = isDoctor ? doctorRating : clinicRating;
		const formData = isDoctor ? doctorFormData : clinicFormData;
		const setFormData = isDoctor ? setDoctorFormData : setClinicFormData;
		const isEditing = isDoctor ? editingDoctor : editingClinic;
		const setEditing = isDoctor ? setEditingDoctor : setEditingClinic;
		const hoveredStar = isDoctor ? hoveredDoctorStar : hoveredClinicStar;
		const setHoveredStar = isDoctor
			? setHoveredDoctorStar
			: setHoveredClinicStar;
		const Icon = isDoctor ? User : Building2;

		if (!isEditing && !rating) {
			// Show add rating button
			return (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<div className="flex items-center gap-3 mb-4">
						<Icon
							size={24}
							className={isDoctor ? "text-blue-600" : "text-green-600"}
						/>
						<h3 className="text-lg font-semibold text-gray-900">
							Rate the {type.charAt(0).toUpperCase() + type.slice(1)}
						</h3>
					</div>

					<button
						onClick={() => setEditing(true)}
						className={`w-full py-2 px-4 rounded-lg border-2 border-dashed transition-colors ${
							isDoctor
								? "border-blue-300 text-blue-600 hover:bg-blue-50"
								: "border-green-300 text-green-600 hover:bg-green-50"
						}`}
					>
						+ Add {type.charAt(0).toUpperCase() + type.slice(1)} Rating
					</button>
				</div>
			);
		}

		if (isEditing) {
			// Edit mode
			return (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<div className="flex items-center gap-3 mb-4">
						<Icon
							size={24}
							className={isDoctor ? "text-blue-600" : "text-green-600"}
						/>
						<h3 className="text-lg font-semibold text-gray-900">
							{rating ? "Edit" : "Rate"}{" "}
							{type.charAt(0).toUpperCase() + type.slice(1)}
						</h3>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmitRating(type);
						}}
						className="space-y-4"
					>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Rating <span className="text-red-500">*</span>
							</label>
							{renderStars(
								formData.rating,
								hoveredStar,
								setHoveredStar,
								(value) => setFormData({ ...formData, rating: value }),
								true,
							)}
							<p className="text-xs text-gray-500 mt-1">
								Rate your experience with the {type}
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Comment (Optional)
							</label>
							<textarea
								value={formData.comment}
								onChange={(e) =>
									setFormData({ ...formData, comment: e.target.value })
								}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder={`Share your experience with the ${type}...`}
								maxLength={500}
							/>
							<p className="text-xs text-gray-500 mt-1">
								{formData.comment.length}/500 characters
							</p>
						</div>

						{error[type] && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
								<X size={18} />
								<span className="text-sm">{error[type]}</span>
							</div>
						)}

						{success[type] && (
							<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
								<Check size={18} />
								<span className="text-sm">{success[type]}</span>
							</div>
						)}

						<div className="flex gap-3">
							<button
								type="submit"
								disabled={loading[type]}
								className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
									isDoctor
										? "bg-blue-600 hover:bg-blue-700"
										: "bg-green-600 hover:bg-green-700"
								}`}
							>
								{loading[type]
									? "Submitting..."
									: rating
										? "Update Rating"
										: "Submit Rating"}
							</button>
							<button
								type="button"
								onClick={() => handleCancel(type)}
								disabled={loading[type]}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			);
		}

		// Display mode
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex justify-between items-start mb-4">
					<div className="flex items-center gap-3">
						<Icon
							size={24}
							className={isDoctor ? "text-blue-600" : "text-green-600"}
						/>
						<h3 className="text-lg font-semibold text-gray-900">
							Your {type.charAt(0).toUpperCase() + type.slice(1)} Rating
						</h3>
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => setEditing(true)}
							className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
							title="Edit Rating"
						>
							<Edit2 size={18} />
						</button>
						<button
							onClick={() => handleDeleteRating(type)}
							className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
							title="Delete Rating"
							disabled={loading[type]}
						>
							<Trash2 size={18} />
						</button>
					</div>
				</div>

				<div className="space-y-3">
					<div>
						<div className="flex items-center gap-2">
							{renderStars(rating.rating, 0, null, null, false)}
							<span className="text-sm text-gray-600">({rating.rating}/5)</span>
						</div>
					</div>

					{rating.comment && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Comment
							</label>
							<p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
								{rating.comment}
							</p>
						</div>
					)}

					<p className="text-xs text-gray-500">
						Submitted on{" "}
						{new Date(rating.createdAt).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>

				{success[type] && (
					<div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
						<Check size={18} />
						<span className="text-sm">{success[type]}</span>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-xl font-bold text-gray-900 mb-2">
					Rate Your Experience
				</h2>
				<p className="text-gray-600 text-sm">
					Help others by sharing your experience with the doctor and clinic
				</p>
			</div>

			{/* Doctor Rating Section */}
			{doctorId && renderRatingSection("doctor")}

			{/* Clinic Rating Section */}
			{clinicId && renderRatingSection("clinic")}
		</div>
	);
};

export default RatingComponent;
