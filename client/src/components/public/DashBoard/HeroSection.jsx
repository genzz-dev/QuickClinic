// components/HeroSection.jsx
import {
	Search,
	MapPin,
	Shield,
	ArrowRight,
	Stethoscope,
	Building2,
	Heart,
	Brain,
	Eye,
	Activity,
} from "lucide-react";
import Loading from "../../ui/Loading";

const specialties = [
	{
		name: "Cardiology",
		icon: Heart,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "Neurology",
		icon: Brain,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "Ophthalmology",
		icon: Eye,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "General Medicine",
		icon: Stethoscope,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "Orthopedics",
		icon: Activity,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "Dermatology",
		icon: Shield,
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
];

const HeroSection = ({
	stats,
	searchQuery,
	setSearchQuery,
	searchType,
	setSearchType,
	suggestions,
	searchStats,
	isLoading,
	handleSearch,
	handleSuggestionClick,
	navigate,
}) => {
	return (
		<section className="relative bg-white">
			<div className="px-4 sm:px-6 lg:px-8 pt-16 pb-20">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					{/* Left Content */}
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="flex items-center space-x-2 text-blue-600">
								<Shield className="w-5 h-5" />
								<span className="text-sm font-medium">
									Verified Healthcare Network
								</span>
							</div>
							<h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
								Professional
								<span className="block text-blue-600">Healthcare Access</span>
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed max-w-xl">
								Connect with verified healthcare professionals, schedule
								appointments seamlessly, and access quality medical care with
								confidence.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<button
								onClick={() => navigate("/register")}
								className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
							>
								Find Healthcare Providers
								<ArrowRight className="ml-2 w-5 h-5" />
							</button>
							<button
								onClick={() => navigate("/nearby")}
								className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
							>
								<MapPin className="mr-2 w-5 h-5" />
								Locate Nearby Clinics
							</button>
						</div>

						{/* Professional Stats */}
						<div className="grid grid-cols-3 gap-8 pt-8">
							<div className="text-center">
								<div className="text-3xl font-bold text-gray-900">
									{stats.totalDoctors}
								</div>
								<div className="text-sm text-gray-600 font-medium">
									Verified Doctors
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-gray-900">
									{stats.totalClinics}
								</div>
								<div className="text-sm text-gray-600 font-medium">
									Partner Clinics
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-gray-900">
									{stats.totalAppointments}
								</div>
								<div className="text-sm text-gray-600 font-medium">
									Appointments Booked
								</div>
							</div>
						</div>
					</div>

					{/* Professional Search Section */}
					<div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
						<div className="space-y-6">
							<div className="text-center">
								<h2 className="text-2xl font-semibold text-gray-900">
									Find Healthcare Providers
								</h2>
								<p className="text-gray-600 mt-1">
									Search doctors and clinics near you
								</p>
							</div>

							{/* Clean Search Type Toggle */}
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setSearchType("doctors")}
									className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
										searchType === "doctors"
											? "bg-white text-blue-600 shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									<Stethoscope className="w-4 h-4 inline mr-2" />
									Doctors
								</button>
								<button
									onClick={() => setSearchType("clinics")}
									className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
										searchType === "clinics"
											? "bg-white text-blue-600 shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									<Building2 className="w-4 h-4 inline mr-2" />
									Clinics
								</button>
							</div>

							{/* Clean Search Form */}
							<form onSubmit={handleSearch} className="space-y-4">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder={`Search for ${searchType}...`}
										className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										autoComplete="off"
									/>

									{/* Clean Suggestions */}
									{suggestions.length > 0 && (
										<div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
											{suggestions.slice(0, 6).map((suggestion, index) => (
												<button
													key={index}
													type="button"
													onClick={() => handleSuggestionClick(suggestion)}
													className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
												>
													{suggestion.type === "doctor" ? (
														<div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
															<Stethoscope className="w-4 h-4 text-blue-600" />
														</div>
													) : suggestion.type === "clinic" ? (
														<div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
															<Building2 className="w-4 h-4 text-gray-600" />
														</div>
													) : (
														<div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
															<Search className="w-4 h-4 text-gray-600" />
														</div>
													)}
													<div className="flex-1">
														<div className="font-medium text-gray-900">
															{suggestion.name || suggestion}
														</div>
														{suggestion.specialization && (
															<div className="text-xs text-gray-500">
																{suggestion.specialization}
															</div>
														)}
														{suggestion.location && (
															<div className="text-xs text-gray-500">
																{suggestion.location}
															</div>
														)}
													</div>
												</button>
											))}
										</div>
									)}
								</div>

								<button
									type="submit"
									disabled={isLoading || !searchQuery.trim()}
									className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? <Loading /> : `Search ${searchType}`}
								</button>
							</form>

							{/* Clean Specialties */}
							<div className="space-y-3">
								<h3 className="font-medium text-gray-900">
									Popular Specialties
								</h3>
								<div className="grid grid-cols-2 gap-2">
									{(searchStats.topSpecialties.length > 0
										? searchStats.topSpecialties
										: specialties.map((s) => s.name)
									)
										.slice(0, 4)
										.map((specialty, index) => {
											const specialtyData =
												specialties.find((s) => s.name === specialty) ||
												specialties[index % specialties.length];
											return (
												<button
													key={index}
													onClick={() => {
														setSearchQuery(specialty);
														setSearchType("doctors");
													}}
													className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
												>
													<specialtyData.icon className="w-4 h-4 text-gray-600" />
													<span className="text-sm text-gray-700">
														{specialty}
													</span>
												</button>
											);
										})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
