import { Activity, Heart, Stethoscope, UserPlus } from "lucide-react";

const FloatingIcon = ({ Icon, className, color = "blue" }) => (
	<div className={`absolute opacity-10 animate-pulse ${className}`}>
		<Icon className={`w-12 h-12 text-${color}-500`} />
	</div>
);

export const AuthLayout = ({ title, subtitle, children, theme = "blue" }) => {
	const floating = [
		{ Icon: Heart, className: "top-10 left-10 animate-bounce", color: theme },
		{ Icon: Stethoscope, className: "top-20 right-16", color: theme },
		{ Icon: Activity, className: "bottom-16 left-12", color: theme },
		{
			Icon: UserPlus,
			className: "bottom-10 right-10 animate-pulse",
			color: theme,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center relative overflow-hidden p-4">
			{floating.map((f, i) => (
				<FloatingIcon key={i} {...f} />
			))}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>

			<div className="w-full max-w-md relative z-10">
				<div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-200">
					<div className="mb-8 text-center">
						<div className="flex items-center justify-center gap-3 mb-4">
							<div className="p-2 bg-blue-100 rounded-full">
								<Stethoscope className="w-8 h-8 text-blue-600" />
							</div>
							<span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
								Quick Clinic
							</span>
						</div>
						<h1 className="text-2xl font-semibold text-gray-900 mb-2">
							{title}
						</h1>
						{subtitle && <p className="text-gray-600">{subtitle}</p>}
					</div>
					{children}
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
