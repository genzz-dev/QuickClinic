import { Search, Filter, X, AlertCircle } from "lucide-react";

const HeaderSection = ({
	userLocation,
	showFilters,
	setShowFilters,
	locationError,
}) => {
	return (
		<div className="bg-white/70 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-blue-100">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="bg-blue-600 p-2 rounded-lg">
							<Search className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{userLocation ? "Doctors Near You" : "All Doctors"}
							</h1>
							<p className="text-gray-600 text-sm">
								Find the best healthcare professionals in your area
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
								showFilters
									? "bg-blue-600 text-white shadow-lg"
									: "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
							}`}
						>
							<Filter className="w-4 h-4" />
							Filters
							{showFilters && <X className="w-4 h-4 ml-1" />}
						</button>

						{locationError && (
							<div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200">
								<AlertCircle className="w-4 h-4" />
								<span className="text-sm font-medium">{locationError}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeaderSection;
