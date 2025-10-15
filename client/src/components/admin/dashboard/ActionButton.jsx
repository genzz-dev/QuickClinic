import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const ActionButton = ({
	icon: Icon,
	title,
	description,
	onClick,
	variant = "secondary",
	loading = false,
}) => {
	const variants = {
		primary:
			"bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
		secondary:
			"bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md",
		accent:
			"bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl",
	};

	return (
		<button
			onClick={onClick}
			disabled={loading}
			className={`w-full p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group`}
		>
			<div className="flex items-center space-x-4">
				<div
					className={`p-2 rounded-lg ${variant === "primary" || variant === "accent" ? "bg-white bg-opacity-20" : "bg-slate-100"}`}
				>
					{loading ? (
						<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
					) : (
						<Icon
							className={`h-5 w-5 ${variant === "primary" || variant === "accent" ? "text-white" : "text-slate-600"} group-hover:scale-110 transition-transform duration-200`}
						/>
					)}
				</div>
				<div className="flex-1 text-left">
					<h3 className="font-semibold text-sm mb-1 group-hover:translate-x-1 transition-transform duration-200">
						{title}
					</h3>
					<p
						className={`text-xs opacity-80 ${variant === "primary" || variant === "accent" ? "text-white" : "text-slate-500"}`}
					>
						{description}
					</p>
				</div>
				<ArrowRightIcon
					className={`h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ${variant === "primary" || variant === "accent" ? "text-white" : "text-slate-400"}`}
				/>
			</div>
		</button>
	);
};

export default ActionButton;
