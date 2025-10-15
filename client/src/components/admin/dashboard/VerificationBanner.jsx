import React from "react";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

const VerificationBanner = ({ clinicData, onVerify, onSetup }) => {
	if (!clinicData) {
		return (
			<div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
				<div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
					<ShieldExclamationIcon className="h-8 w-8 text-gray-500" />
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Setup Required
				</h3>
				<p className="text-gray-600 mb-6">
					Add your clinic details to unlock verification and management
					features.
				</p>
				<button
					onClick={onSetup}
					className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
				>
					Setup Clinic
				</button>
			</div>
		);
	}

	const getisVerified = () => {
		const { isVerified, verificationAttempts } = clinicData;
		const attemptsMade = verificationAttempts?.length || 0;
		const attemptsRemaining = Math.max(0, 3 - attemptsMade);

		if (isVerified) {
			return {
				type: "success",
				title: "Clinic Verified",
				message: "All features unlocked and listing is active for patients.",
				icon: CheckCircleIcon,
				bgColor: "bg-gradient-to-r from-emerald-50 to-emerald-100",
				borderColor: "border-emerald-200",
				iconBg: "bg-emerald-100",
				iconColor: "text-emerald-600",
				textColor: "text-emerald-800",
			};
		}

		if (attemptsMade >= 3) {
			return {
				type: "error",
				title: "Verification Suspended",
				message:
					"Max attempts exceeded. Our team will review your clinic details.",
				icon: ExclamationTriangleIcon,
				bgColor: "bg-gradient-to-r from-red-50 to-red-100",
				borderColor: "border-red-200",
				iconBg: "bg-red-100",
				iconColor: "text-red-600",
				textColor: "text-red-800",
			};
		}

		return {
			type: "pending",
			title: "Verification Pending",
			message: `Complete verification to unlock full admin capabilities.`,
			subMessage: `Attempts remaining: ${attemptsRemaining} (used: ${attemptsMade})`,
			icon: ShieldExclamationIcon,
			bgColor: "bg-gradient-to-r from-amber-50 to-amber-100",
			borderColor: "border-amber-200",
			iconBg: "bg-amber-100",
			iconColor: "text-amber-600",
			textColor: "text-amber-800",
		};
	};

	const status = getisVerified();
	const Icon = status.icon;

	return (
		<div
			className={`${status.bgColor} border-2 ${status.borderColor} rounded-xl p-6`}
		>
			<div className="flex items-start space-x-4">
				<div className={`flex-shrink-0 p-3 rounded-lg ${status.iconBg}`}>
					<Icon className={`h-6 w-6 ${status.iconColor}`} />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className={`font-semibold text-lg ${status.textColor} mb-1`}>
						{status.title}
					</h3>
					<p className={`${status.textColor} opacity-90 mb-2`}>
						{status.message}
					</p>
					{status.subMessage && (
						<p className={`text-sm ${status.textColor} opacity-75`}>
							{status.subMessage}
						</p>
					)}
					{status.type === "pending" && (
						<button
							onClick={onVerify}
							className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
						>
							Start Verification
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default VerificationBanner;
