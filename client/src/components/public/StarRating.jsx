import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import {
	getDoctorRatings,
	getClinicRatings,
} from "../../service/ratingApiService";

const StarRating = ({
	type, // 'doctor' or 'clinic'
	id, // doctorId or clinicId
	size = "medium", // 'small', 'medium', 'large'
	showCount = true,
	showAverage = true,
	inline = true,
	detailed = false, // Show individual ratings when true
}) => {
	const [ratingData, setRatingData] = useState({
		averageRating: 0,
		totalRatingCount: 0,
		ratings: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!id || !type) return;

		const fetchRatings = async () => {
			try {
				setLoading(true);
				setError(null);

				let response;
				if (type === "doctor") {
					response = await getDoctorRatings(id, { limit: detailed ? 10 : 1 });
				} else if (type === "clinic") {
					response = await getClinicRatings(id, { limit: detailed ? 10 : 1 });
				}

				if (response) {
					setRatingData({
						averageRating: response.averageRating || 0,
						totalRatingCount: response.totalRatingCount || 0,
						ratings: response.ratings || [],
					});
				}
			} catch (err) {
				console.error("Error fetching ratings:", err);
				setError("Failed to load ratings");
			} finally {
				setLoading(false);
			}
		};

		fetchRatings();
	}, [id, type, detailed]);

	const getSizeClasses = () => {
		switch (size) {
			case "small":
				return "w-3 h-3";
			case "large":
				return "w-6 h-6";
			default:
				return "w-4 h-4";
		}
	};

	const getTextSizeClasses = () => {
		switch (size) {
			case "small":
				return "text-xs";
			case "large":
				return "text-lg";
			default:
				return "text-sm";
		}
	};

	const renderStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(
					<Star
						key={i}
						className={`${getSizeClasses()} fill-yellow-400 text-yellow-400`}
					/>,
				);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<div key={i} className="relative">
						<Star className={`${getSizeClasses()} text-gray-300`} />
						<div className="absolute inset-0 overflow-hidden w-1/2">
							<Star
								className={`${getSizeClasses()} fill-yellow-400 text-yellow-400`}
							/>
						</div>
					</div>,
				);
			} else {
				stars.push(
					<Star key={i} className={`${getSizeClasses()} text-gray-300`} />,
				);
			}
		}

		return stars;
	};

	if (loading) {
		return (
			<div className={`${inline ? "inline-flex" : "flex"} items-center gap-1`}>
				<div
					className={`${getSizeClasses()} bg-gray-200 rounded animate-pulse`}
				></div>
				<div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
			</div>
		);
	}

	if (error || ratingData.totalRatingCount === 0) {
		return (
			<div
				className={`${inline ? "inline-flex" : "flex"} items-center gap-1 ${getTextSizeClasses()} text-gray-500`}
			>
				{renderStars(0)}
				<span>No ratings yet</span>
			</div>
		);
	}

	const containerClass = inline ? "inline-flex" : "flex";

	if (detailed) {
		return (
			<div className="space-y-4">
				{/* Summary */}
				<div className={`${containerClass} items-center gap-2`}>
					<div className="flex items-center gap-1">
						{renderStars(ratingData.averageRating)}
					</div>
					{showAverage && (
						<span
							className={`${getTextSizeClasses()} font-medium text-gray-900`}
						>
							{ratingData.averageRating.toFixed(1)}
						</span>
					)}
					{showCount && (
						<span className={`${getTextSizeClasses()} text-gray-600`}>
							({ratingData.totalRatingCount} review
							{ratingData.totalRatingCount !== 1 ? "s" : ""})
						</span>
					)}
				</div>

				{/* Individual Reviews */}
				{ratingData.ratings.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-medium text-gray-900">Recent Reviews</h4>
						{ratingData.ratings.map((rating, index) => (
							<div
								key={rating._id || index}
								className="border-b border-gray-100 pb-3 last:border-b-0"
							>
								<div className="flex items-center gap-2 mb-1">
									<div className="flex items-center gap-1">
										{renderStars(rating.rating)}
									</div>
									<span className="text-sm font-medium text-gray-900">
										{rating.patientId?.firstName} {rating.patientId?.lastName}
									</span>
									<span className="text-xs text-gray-500">
										{new Date(rating.createdAt).toLocaleDateString()}
									</span>
								</div>
								{rating.comment && (
									<p className="text-sm text-gray-700 mt-1">{rating.comment}</p>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={`${containerClass} items-center gap-2`}>
			<div className="flex items-center gap-1">
				{renderStars(ratingData.averageRating)}
			</div>
			{showAverage && (
				<span className={`${getTextSizeClasses()} font-medium text-gray-900`}>
					{ratingData.averageRating.toFixed(1)}
				</span>
			)}
			{showCount && (
				<span className={`${getTextSizeClasses()} text-gray-600`}>
					({ratingData.totalRatingCount})
				</span>
			)}
		</div>
	);
};

export default StarRating;
