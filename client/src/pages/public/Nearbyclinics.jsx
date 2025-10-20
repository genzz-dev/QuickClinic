import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ClinicCard from "../../components/public/Nearbyclinics/ClinicCard";
import ClinicFilters from "../../components/public/Nearbyclinics/ClinicFilters";
import ErrorState from "../../components/public/Nearbyclinics/ErrorState";
import LoadingState from "../../components/public/Nearbyclinics/LoadingState";
import NoClinicsFound from "../../components/public/Nearbyclinics/NoClinicsFound";
import Loading from "../../components/ui/Loading";
import { getClinicDoctors, searchClinics } from "../../service/publicapi";

const NearbyClinicsPage = () => {
	const [clinics, setClinics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [locationError, setLocationError] = useState(null);
	const [hoveredClinic, setHoveredClinic] = useState(null);
	const [clinicDoctors, setClinicDoctors] = useState({});
	const [filteredClinics, setFilteredClinics] = useState([]);
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		doctorAvailable: false,
		telemedicine: false,
		specializations: [],
		openNow: false,
		openWeekends: false,
		facilities: [],
	});

	// Calculate available filters based on fetched clinics
	// Calculate available filters
	const availableFilters = useMemo(() => {
		const filterData = {
			specializations: new Set(),
			facilities: new Set(),
			hasTelemedicine: false,
			hasDoctors: false,
			hasWeekendHours: false,
		};

		clinics.forEach((clinic) => {
			// Basic filters
			if (clinic.doctors && clinic.doctors.length > 0) {
				filterData.hasDoctors = true;
			}
			console.log(clinic);
			if (clinic.facilities) {
				clinic.facilities.forEach((facility) => {
					filterData.facilities.add(facility);
				});
			}

			if (
				clinic.openingHours?.saturday?.open ||
				clinic.openingHours?.sunday?.open
			) {
				filterData.hasWeekendHours = true;
			}

			// Doctor filters - use basic info first
			clinic.basicDoctors?.forEach((doctor) => {
				if (doctor.availableForTeleconsultation) {
					filterData.hasTelemedicine = true;
				}
				if (doctor.specialization && doctor.specialization !== "Loading...") {
					filterData.specializations.add(doctor.specialization);
				}
			});

			// Override with detailed info if available
			clinic.doctors?.forEach((doctorId) => {
				const doctor = clinicDoctors[doctorId];
				if (doctor?.availableForTeleconsultation) {
					filterData.hasTelemedicine = true;
				}
				if (doctor?.specialization) {
					filterData.specializations.add(doctor.specialization);
				}
			});
		});

		return {
			specializations: Array.from(filterData.specializations).sort(),
			facilities: Array.from(filterData.facilities).sort(),
			hasTelemedicine: filterData.hasTelemedicine,
			hasDoctors: filterData.hasDoctors,
			hasWeekendHours: filterData.hasWeekendHours,
			filtersReady: true, // Now always true since we have basic info
		};
	}, [clinics, clinicDoctors]);

	// Get user's location
	useEffect(() => {
		const getUserLocation = async () => {
			try {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						async (position) => {
							const { latitude, longitude } = position.coords;
							await fetchNearbyClinics(latitude, longitude);
						},
						async (error) => {
							console.log(`Geolocation denied, falling back to IP location ${error}`);
							await getLocationFromIP();
						},
					);
				} else {
					await getLocationFromIP();
				}
			} catch (error) {
				setLocationError(`Unable to get location ${error}`);
				setLoading(false);
			}
		};

		getUserLocation();
	}, []);

	// Apply filters when clinics or filters change
	useEffect(() => {
		if (clinics.length === 0) return;

		const now = new Date();
		const currentDay = now
			.toLocaleString("en-us", { weekday: "long" })
			.toLowerCase();
		const currentHour = now.getHours();
		const currentMinutes = now.getMinutes();
		const currentTime = `${currentHour}:${currentMinutes < 10 ? "0" + currentMinutes : currentMinutes}`;

		const filtered = clinics.filter((clinic) => {
			// Doctor availability filter
			if (
				filters.doctorAvailable &&
				(!clinic.doctors || clinic.doctors.length === 0)
			) {
				return false;
			}

			// Telemedicine filter
			if (filters.telemedicine) {
				const hasTelemedicineDoctor = clinic.doctors?.some((doctorId) => {
					const doctor = clinicDoctors[doctorId];
					return doctor?.availableForTeleconsultation;
				});
				if (!hasTelemedicineDoctor) return false;
			}

			// Specializations filter
			if (filters.specializations.length > 0) {
				const hasMatchingSpecialization = clinic.doctors?.some((doctorId) => {
					const doctor = clinicDoctors[doctorId];
					return (
						doctor && filters.specializations.includes(doctor.specialization)
					);
				});
				if (!hasMatchingSpecialization) return false;
			}

			// Open now filter
			if (filters.openNow && clinic.openingHours) {
				const todayHours = clinic.openingHours[currentDay];
				if (
					!todayHours ||
					!isTimeBetween(currentTime, todayHours.open, todayHours.close)
				) {
					return false;
				}
			}

			// Open weekends filter
			if (filters.openWeekends && clinic.openingHours) {
				const isWeekendOpen =
					clinic.openingHours.saturday?.open &&
					clinic.openingHours.sunday?.open;
				if (!isWeekendOpen) return false;
			}

			// Facilities filter
			if (filters.facilities.length > 0) {
				const hasAllFacilities = filters.facilities.every((facility) =>
					clinic.facilities?.includes(facility),
				);
				if (!hasAllFacilities) return false;
			}

			return true;
		});

		setFilteredClinics(filtered);
	}, [clinics, filters, clinicDoctors]);

	const handleFilterChange = (filterName, value) => {
		setFilters((prev) => ({
			...prev,
			[filterName]: value,
		}));
	};

	const resetFilters = () => {
		setFilters({
			doctorAvailable: false,
			telemedicine: false,
			specializations: [],
			openNow: false,
			openWeekends: false,
			facilities: [],
		});
	};

	const isTimeBetween = (current, open, close) => {
		const [currentH, currentM] = current.split(":").map(Number);
		const [openH, openM] = open.split(":").map(Number);
		const [closeH, closeM] = close.split(":").map(Number);

		const currentTotal = currentH * 60 + currentM;
		const openTotal = openH * 60 + openM;
		const closeTotal = closeH * 60 + closeM;

		return currentTotal >= openTotal && currentTotal <= closeTotal;
	};

	const getLocationFromIP = async () => {
		try {
			const response = await fetch("https://ipapi.co/json/");
			const data = await response.json();
			await fetchNearbyClinics(
				data.latitude,
				data.longitude,
				data.city,
				data.region,
			);
		} catch (error) {
			setLocationError("Unable to determine location");
			setLoading(false);
		}
	};

	const fetchNearbyClinics = async (lat, lng, city, state) => {
		try {
			const params = {};
			if (city) params.city = city;
			if (state) params.state = state;

			const response = await searchClinics(params);

			if (response.success) {
				// Filter clinics by distance (e.g., within 10km)
				const nearbyClinics = response.data.filter((clinic) => {
					if (
						!clinic.address?.coordinates?.lat ||
						!clinic.address?.coordinates?.lng
					) {
						return false; // Skip clinics without coordinates
					}

					const distance = calculateDistance(
						lat,
						lng,
						clinic.address.coordinates.lat,
						clinic.address.coordinates.lng,
					);

					return distance <= 10; // 10km radius
				});

				// Sort by distance
				const sortedClinics = nearbyClinics.sort((a, b) => {
					const distanceA = calculateDistance(
						lat,
						lng,
						a.address.coordinates.lat,
						a.address.coordinates.lng,
					);
					const distanceB = calculateDistance(
						lat,
						lng,
						b.address.coordinates.lat,
						b.address.coordinates.lng,
					);
					return distanceA - distanceB;
				});

				const clinicsWithBasicDoctorInfo = sortedClinics.map((clinic) => ({
					...clinic,
					basicDoctors:
						clinic.doctors?.map((doctorId) => ({
							id: doctorId,
							specialization: "Loading...",
							availableForTeleconsultation: false,
						})) || [],
				}));

				setClinics(clinicsWithBasicDoctorInfo);
				
			}
		} catch (error) {
			console.error("Error fetching clinics:", error);
		} finally {
			setLoading(false);
		}
	};

	// Add this helper function
	const calculateDistance = (lat1, lng1, lat2, lng2) => {
		const R = 6371; // Earth's radius in kilometers
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c; // Distance in kilometers
	};

	const handleClinicHover = async (clinicId) => {
		setHoveredClinic(clinicId);

		if (!clinicDoctors[clinicId]) {
			try {
				const response = await getClinicDoctors(clinicId);
				if (response.success) {
					setClinicDoctors((prev) => ({
						...prev,
						[clinicId]: response.data.doctors,
					}));
				}
			} catch (error) {
				console.error("Error fetching doctors:", error);
			}
		}
	};

	const handleClinicClick = (clinicId) => {
		console.log(clinicId);
		navigate(`/clinic/${clinicId}`);
	};

	const handleRetry = () => {
		window.location.reload();
	};

	if (loading) return <Loading />;
	if (locationError)
		return <ErrorState error={locationError} onRetry={handleRetry} />;
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm">
				<div className="px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center space-x-2">
						<MapPin className="h-6 w-6 text-blue-600" />
						<h1 className="text-2xl font-bold text-gray-900">Nearby Clinics</h1>
					</div>
					<p className="text-gray-600 mt-2">
						Found {filteredClinics.length} clinics in your area
					</p>
				</div>
			</div>

			<div className="px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row gap-6">
					<ClinicFilters
						specializations={availableFilters.specializations}
						facilities={availableFilters.facilities}
						showTelemedicineFilter={availableFilters.hasTelemedicine}
						showDoctorFilter={availableFilters.hasDoctors}
						showWeekendFilter={availableFilters.hasWeekendHours}
						onFilterChange={handleFilterChange}
						filters={filters}
						onResetFilters={resetFilters}
					/>

					<div className="flex-1">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredClinics.map((clinic) => (
								<ClinicCard
									key={clinic._id}
									clinic={clinic}
									hoveredClinic={hoveredClinic}
									handleClinicHover={handleClinicHover}
									handleClinicClick={handleClinicClick}
									clinicDoctors={clinicDoctors}
								/>
							))}
						</div>

						{filteredClinics.length === 0 && (
							<NoClinicsFound onRefresh={handleRetry} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default NearbyClinicsPage;
