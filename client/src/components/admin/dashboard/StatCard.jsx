import React from "react";

const StatCard = ({ icon: Icon, title, value, color, bgColor, iconColor }) => (
	<div
		className={`${bgColor} rounded-xl p-4 border border-opacity-20 hover:shadow-md transition-all duration-300 cursor-pointer group`}
	>
		<div className="flex items-center justify-between">
			<div className="flex-1">
				<div className="flex items-center space-x-3">
					<div
						className={`p-2 rounded-lg ${iconColor.replace("text-", "bg-").replace("600", "100")}`}
					>
						<Icon className={`h-5 w-5 ${iconColor}`} />
					</div>
					<div>
						<p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
						<p
							className={`text-2xl font-bold ${iconColor.replace("600", "700")} group-hover:scale-105 transition-transform duration-200`}
						>
							{value}
						</p>
					</div>
				</div>
			</div>
			<div className="w-2 h-12 bg-gradient-to-b from-transparent via-current to-transparent opacity-20 rounded-full"></div>
		</div>
	</div>
);

export default StatCard;
