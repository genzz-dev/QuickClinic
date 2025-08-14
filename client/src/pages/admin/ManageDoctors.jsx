import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiPlus, FiTrash2, FiCalendar, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import {
  getClinicDoctors,
  addDoctor,
  deleteDoctorFromClinic,
  setDoctorSchedule,
  getDoctorSchedule
} from "../../service/adminApiService"

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

// Helpers
const emptyWorkingWeek = () =>
  DAYS.map(day => ({ day, isWorking: false, startTime: "09:00", endTime: "17:00" }));

const defaultSchedule = () => ({
  workingDays: emptyWorkingWeek(),
  breaks: [], // { day, startTime, endTime, reason }
  vacations: [], // { startDate, endDate, reason }
  appointmentDuration: 30
});

function classNames(...c) { return c.filter(Boolean).join(" "); }

// Tabs
const Tabs = ({ tabs, current, onChange }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={classNames(
            current === t.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300",
            "whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium"
          )}
        >
          {t.label}
        </button>
      ))}
    </nav>
  </div>
);

// Modal
const ScheduleModal = ({ open, onClose, doctor, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(defaultSchedule());
  const [tab, setTab] = useState("days"); // 'days' | 'breaks' | 'vacations' | 'settings'
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !doctor) return;
    setError("");
    setLoading(true);
    (async () => {
      try {
        const res = await getDoctorSchedule(doctor._id);
        const data = res?.schedule || res; // support either shape
        const existingDays = data?.workingDays || [];
        const fullWeek = DAYS.map(day => {
          const found = existingDays.find(d => d.day === day);
          return found || { day, isWorking: false, startTime: "09:00", endTime: "17:00" };
        });
        setSchedule({
          workingDays: fullWeek,
          breaks: data?.breaks || [],
          vacations: data?.vacations || [],
          appointmentDuration: data?.appointmentDuration || 30
        });
      } catch (e) {
        // If not found (404) or any issue, initialize empty schedule
        setSchedule(defaultSchedule());
      } finally {
        setLoading(false);
      }
    })();
  }, [open, doctor]);

  const onToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      workingDays: prev.workingDays.map(d => d.day === day ? { ...d, isWorking: !d.isWorking } : d)
    }));
  };

  const onTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      workingDays: prev.workingDays.map(d => d.day === day ? { ...d, [field]: value } : d)
    }));
  };

  const addBreak = () => {
    setSchedule(prev => ({
      ...prev,
      breaks: [...prev.breaks, { day: "monday", startTime: "13:00", endTime: "13:30", reason: "" }]
    }));
  };

  const updateBreak = (idx, field, value) => {
    setSchedule(prev => {
      const next = [...prev.breaks];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, breaks: next };
    });
  };

  const removeBreak = (idx) => {
    setSchedule(prev => ({ ...prev, breaks: prev.breaks.filter((_, i) => i !== idx) }));
  };

  const addVacation = () => {
    setSchedule(prev => ({
      ...prev,
      vacations: [...prev.vacations, { startDate: "", endDate: "", reason: "" }]
    }));
  };

  const updateVacation = (idx, field, value) => {
    setSchedule(prev => {
      const next = [...prev.vacations];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, vacations: next };
    });
  };

  const removeVacation = (idx) => {
    setSchedule(prev => ({ ...prev, vacations: prev.vacations.filter((_, i) => i !== idx) }));
  };

  const validate = useCallback(() => {
    // Working days
    for (const d of schedule.workingDays) {
      if (d.isWorking) {
        if (!d.startTime || !d.endTime) return "All working days must have start and end times.";
        if (d.startTime >= d.endTime) return "Start time must be before end time for working days.";
      }
    }
    // Breaks
    for (const b of schedule.breaks) {
      if (!b.day || !b.startTime || !b.endTime) return "All breaks must have day, start, and end times.";
      if (b.startTime >= b.endTime) return "Break start time must be before end time.";
    }
    // Vacations
    for (const v of schedule.vacations) {
      if (!v.startDate || !v.endDate) return "Vacations must have start and end dates.";
      if (new Date(v.startDate) > new Date(v.endDate)) return "Vacation start must be before end date.";
    }
    // Duration
    if (!schedule.appointmentDuration || schedule.appointmentDuration <= 0) {
      return "Appointment duration must be a positive number.";
    }
    return "";
  }, [schedule]);

 const handleSave = async () => {
  const msg = validate();
  if (msg) {
    setError(msg);
    return;
  }
  setError("");

  const payload = {
    workingDays: schedule.workingDays.filter(d => d.isWorking),
    breaks: schedule.breaks,
    vacations: schedule.vacations,
    appointmentDuration: schedule.appointmentDuration
  };

  try {
    await onSave(doctor._id, payload); // pass raw object
    onClose();
  } catch (e) {
    setError(e?.response?.data?.message || "Failed to save schedule.");
  }
};

  const tabs = useMemo(() => ([
    { key: "days", label: "Working Days" },
    { key: "breaks", label: "Breaks" },
    { key: "vacations", label: "Vacations" },
    { key: "settings", label: "Settings" }
  ]), []);

  if (!open || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Schedule — Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <Tabs tabs={tabs} current={tab} onChange={setTab} />
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="animate-spin w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-center text-red-700 bg-red-100 px-3 py-2 rounded">
                  <FiAlertCircle className="mr-2" /> {error}
                </div>
              )}

              {tab === "days" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schedule.workingDays.map(({ day, isWorking, startTime, endTime }) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="capitalize font-medium text-gray-900">{day}</div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isWorking} onChange={() => onToggleDay(day)} />
                          <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full relative transition">
                            <span className={classNames(
                              "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition",
                              isWorking ? "translate-x-5" : "translate-x-0"
                            )} />
                          </div>
                        </label>
                      </div>
                      {isWorking && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={startTime}
                            onChange={e => onTimeChange(day, "startTime", e.target.value)}
                            className="w-1/2 border border-gray-300 rounded px-2 py-1 text-gray-900"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={endTime}
                            onChange={e => onTimeChange(day, "endTime", e.target.value)}
                            className="w-1/2 border border-gray-300 rounded px-2 py-1 text-gray-900"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "breaks" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Breaks</h3>
                    <button onClick={addBreak} className="flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                      <FiPlus className="mr-1" /> Add Break
                    </button>
                  </div>
                  {schedule.breaks.length === 0 ? (
                    <p className="text-gray-500">No breaks added.</p>
                  ) : (
                    <div className="space-y-3">
                      {schedule.breaks.map((b, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            <select
                              value={b.day}
                              onChange={e => updateBreak(idx, "day", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            >
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input
                              type="time"
                              value={b.startTime}
                              onChange={e => updateBreak(idx, "startTime", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            />
                            <input
                              type="time"
                              value={b.endTime}
                              onChange={e => updateBreak(idx, "endTime", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            />
                            <input
                              type="text"
                              placeholder="Reason (optional)"
                              value={b.reason || ""}
                              onChange={e => updateBreak(idx, "reason", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => removeBreak(idx)}
                                className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                title="Remove"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "vacations" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Vacations</h3>
                    <button onClick={addVacation} className="flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                      <FiPlus className="mr-1" /> Add Vacation
                    </button>
                  </div>
                  {schedule.vacations.length === 0 ? (
                    <p className="text-gray-500">No vacations added.</p>
                  ) : (
                    <div className="space-y-3">
                      {schedule.vacations.map((v, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            <input
                              type="date"
                              value={v.startDate ? String(v.startDate).slice(0,10) : ""}
                              onChange={e => updateVacation(idx, "startDate", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            />
                            <input
                              type="date"
                              value={v.endDate ? String(v.endDate).slice(0,10) : ""}
                              onChange={e => updateVacation(idx, "endDate", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                            />
                            <div className="sm:col-span-3">
                              <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={v.reason || ""}
                                onChange={e => updateVacation(idx, "reason", e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => removeVacation(idx)}
                              className="px-3 py-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "settings" && (
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={schedule.appointmentDuration}
                    onChange={e => setSchedule(prev => ({ ...prev, appointmentDuration: +e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2 w-40 text-gray-900"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newDoctorId, setNewDoctorId] = useState("");
  const [error, setError] = useState("");
  const [modalDoctor, setModalDoctor] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getClinicDoctors();
      setDoctors(res?.doctors || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDoctorId.trim()) return;
    setAdding(true);
    setError("");
    try {
      await addDoctor(newDoctorId.trim());
      setNewDoctorId("");
      await fetchDoctors();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add doctor.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this doctor from clinic?")) return;
    try {
      await deleteDoctorFromClinic(id);
      await fetchDoctors();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete doctor.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-600 mt-1">Add, remove, and configure schedules for clinic doctors.</p>
        </header>

        {error && (
          <div className="mb-6 flex items-center text-red-700 bg-red-100 px-3 py-2 rounded">
            <FiAlertCircle className="mr-2" /> {error}
          </div>
        )}

        {/* Add Doctor */}
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Doctor by ID</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDoctorId}
              onChange={(e) => setNewDoctorId(e.target.value)}
              placeholder="Enter Doctor ID"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
            />
            <button
              type="submit"
              disabled={adding || !newDoctorId.trim()}
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {adding ? <FiLoader className="animate-spin mr-2" /> : <FiPlus className="mr-2" />}
              {adding ? "Adding..." : "Add Doctor"}
            </button>
          </form>
        </section>

        {/* Doctors List */}
        <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctors</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <FiLoader className="animate-spin w-8 h-8 text-blue-600" />
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-gray-600">No doctors added yet.</p>
          ) : (
            <ul className="space-y-4">
              {doctors.map(doc => (
                <li key={doc._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.profilePicture || `https://ui-avatars.com/api/?name=${doc.firstName}+${doc.lastName}`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {doc.firstName} {doc.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{doc.specialization || "General"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalDoctor(doc)}
                      className="inline-flex items-center px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    >
                      <FiCalendar className="mr-2" /> Schedule
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      title="Remove"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={!!modalDoctor}
        onClose={() => setModalDoctor(null)}
        doctor={modalDoctor}
        onSave={async (id, dataAsStrings) => {
          // The api service appends raw values; ensure correct string/JSON payload
          // Build a FormData-compatible object for the service:
          const payload = {
            workingDays: dataAsStrings.workingDays,
            breaks: dataAsStrings.breaks,
            vacations: dataAsStrings.vacations,
            appointmentDuration: dataAsStrings.appointmentDuration
          };
          await setDoctorSchedule(id, payload);
        }}
      />
    </div>
  );
};

export default ManageDoctors;
