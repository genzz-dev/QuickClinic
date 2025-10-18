// Public API service that exposes all public endpoints
import { get } from "./publicapiservice";

const searchDoctors = (params) => get("/doctors/search", params);
const getDoctorById = (id) => get(`/doctors/${id}`);
const getDoctorSchedule = (doctorId) => get(`/doctors/${doctorId}/schedule`);
const getDoctorAvailability = (doctorId, date) =>
	get(`/doctors/${doctorId}/availability`, { date });
const checkDoctorAvailability = (doctorId, date, time) =>
	get(`/doctors/${doctorId}/availability/check`, { date, time });

const searchClinics = (params) => get("/clinics/search", params);
const getClinicById = (id) => get(`/clinics/${id}`);
const getClinicDoctors = (clinicId, page = 1, limit = 20) =>
	get(`/clinics/${clinicId}/doctors`, { page, limit });
const getSearchSuggestions = (query) => get("/search/suggestions", { query });

export {
	searchDoctors,
	getDoctorById,
	getDoctorSchedule,
	getDoctorAvailability,
	checkDoctorAvailability,
	searchClinics,
	getClinicById,
	getClinicDoctors,
	getSearchSuggestions,
};
