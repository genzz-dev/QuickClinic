import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const ClinicFilters = ({
	specializations,
	facilities,
	showTelemedicineFilter,
	showDoctorFilter,
	showWeekendFilter,
	onFilterChange,
	filters,
	onResetFilters,
}) => {
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	return (
		<>
			{/* Mobile filter button */}
			<div className="md:hidden mb-4">
				<button
					onClick={() => setMobileFiltersOpen(true)}
					className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300"
				>
					<SlidersHorizontal className="h-4 w-4 mr-2" />
					Filters
				</button>
			</div>

			{/* Filters sidebar */}
			<div
				className={`${mobileFiltersOpen ? "block" : "hidden"} md:block md:w-64 pr-4`}
			>
				<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4">
					{/* Mobile header */}
					<div className="flex justify-between items-center mb-4 md:hidden">
						<h3 className="font-medium">Filters</h3>
						<button onClick={() => setMobileFiltersOpen(false)}>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Reset button */}
					<button
						onClick={onResetFilters}
						className="text-sm text-blue-600 hover:text-blue-800 mb-4"
					>
						Reset all filters
					</button>

					{/* Doctor Availability */}
					{showDoctorFilter && (
						<div className="mb-6">
							<h4 className="font-medium text-gray-900 mb-2">
								Doctor Availability
							</h4>
							<div className="space-y-2">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={filters.doctorAvailable}
										onChange={(e) =>
											onFilterChange("doctorAvailable", e.target.checked)
										}
										className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="ml-2 text-sm text-gray-700">
										Has available doctors
									</span>
								</label>
								{showTelemedicineFilter && (
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={filters.telemedicine}
											onChange={(e) =>
												onFilterChange("telemedicine", e.target.checked)
											}
											className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">
											Offers telemedicine
										</span>
									</label>
								)}
							</div>
						</div>
					)}

					{/* Specializations */}
					{specializations.length > 0 && (
						<div className="mb-6">
							<h4 className="font-medium text-gray-900 mb-2">
								Specializations
							</h4>
							<div className="space-y-2">
								{specializations.map((spec) => (
									<label key={spec} className="flex items-center">
										<input
											type="checkbox"
											checked={filters.specializations.includes(spec)}
											onChange={(e) => {
												const newSpecs = e.target.checked
													? [...filters.specializations, spec]
													: filters.specializations.filter((s) => s !== spec);
												onFilterChange("specializations", newSpecs);
											}}
											className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">{spec}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{/* Opening Hours */}
					<div className="mb-6">
						<h4 className="font-medium text-gray-900 mb-2">Opening Hours</h4>
						<div className="space-y-2">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={filters.openNow}
									onChange={(e) => onFilterChange("openNow", e.target.checked)}
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span className="ml-2 text-sm text-gray-700">Open now</span>
							</label>
							{showWeekendFilter && (
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={filters.openWeekends}
										onChange={(e) =>
											onFilterChange("openWeekends", e.target.checked)
										}
										className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="ml-2 text-sm text-gray-700">
										Open on weekends
									</span>
								</label>
							)}
						</div>
					</div>

					{/* Facilities */}
					{facilities.length > 0 && (
						<div className="mb-6">
							<h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
							<div className="space-y-2">
								{facilities.map((facility) => (
									<label key={facility} className="flex items-center">
										<input
											type="checkbox"
											checked={filters.facilities.includes(facility)}
											onChange={(e) => {
												const newFacilities = e.target.checked
													? [...filters.facilities, facility]
													: filters.facilities.filter((f) => f !== facility);
												onFilterChange("facilities", newFacilities);
											}}
											className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">
											{facility.charAt(0).toUpperCase() +
												facility.slice(1).replace(/([A-Z])/g, " $1")}
										</span>
									</label>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Overlay for mobile */}
			{mobileFiltersOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
					onClick={() => setMobileFiltersOpen(false)}
				/>
			)}
		</>
	);
};

export default ClinicFilters;
