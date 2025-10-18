import { Loader2 } from "lucide-react";

import Loading from "../ui/Loading";

export const AuthButton = ({
	children,
	isLoading = false,
	disabled = false,
	type = "submit",
	onClick,
	className = "",
	variant = "primary",
}) => {
	const baseClasses =
		"w-full flex justify-center items-center gap-2 px-8 py-4 border border-transparent rounded-xl text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";

	const variantClasses = {
		primary:
			"text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl",
		secondary:
			"text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 focus:ring-blue-500",
	};

	const isDisabled = disabled || isLoading;

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={isDisabled}
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
		>
			{isLoading ? (
				<>
					<Loading />
				</>
			) : (
				children
			)}
		</button>
	);
};

export default AuthButton;
