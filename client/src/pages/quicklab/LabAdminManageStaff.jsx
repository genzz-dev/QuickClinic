import { useEffect, useMemo, useState } from 'react';
import '../../quicklab.css';
import { toast } from 'react-toastify';
import { Search, Mail, IdCard, UserPlus, Users, Trash2, X } from 'lucide-react';
import {
  searchLabStaff,
  addStaffToLab,
  removeStaffFromLab,
  getLabStaff,
} from '../../service/labAdminService';

export default function LabAdminManageStaff() {
  const [query, setQuery] = useState({ email: '', staffId: '' });
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [adding, setAdding] = useState(false);
  const [removingIds, setRemovingIds] = useState({});
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [labSearch, setLabSearch] = useState('');

  const canSearch = useMemo(() => {
    return (
      (query.email && query.email.includes('@')) || (!!query.staffId && query.staffId.length >= 8)
    );
  }, [query]);

  const filtered = useMemo(() => {
    const q = labSearch.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter((s) => {
      const name = `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase();
      const email = (s.userId?.email || '').toLowerCase();
      const id = (s._id || '').toLowerCase();
      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [labSearch, staffList]);

  const loadStaffList = async () => {
    try {
      setListLoading(true);
      const res = await getLabStaff();
      setStaffList(res?.staff || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to load staff list');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!canSearch) return;
    try {
      setSearchLoading(true);
      setResult(null);
      const params = {};
      if (query.email) params.email = query.email.trim();
      if (query.staffId) params.staffId = query.staffId.trim();
      const res = await searchLabStaff(params);
      setResult(res?.staff);
      toast.success(res?.message || 'Staff found');
    } catch (err) {
      console.error(err);
      setResult(null);
      toast.error(err?.message || 'No staff found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddStaff = async (staffId) => {
    try {
      setAdding(true);
      await addStaffToLab(staffId);
      toast.success('Staff added to your lab');
      setResult(null);
      setQuery({ email: '', staffId: '' });
      setShowAddPanel(false);
      await loadStaffList();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to add staff');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      setRemovingIds((s) => ({ ...s, [staffId]: true }));
      await removeStaffFromLab(staffId);
      toast.success('Staff removed');
      await loadStaffList();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to remove staff');
    } finally {
      setRemovingIds((s) => ({ ...s, [staffId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-lab-black-900">Manage Staff</h1>
            <p className="text-lab-black-600">Search, add and manage your lab staff</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddPanel(true)}
              className="btn-quicklab-primary px-4 py-2 rounded-lg font-semibold"
            >
              + Add Staff
            </button>
            <Users className="w-8 h-8 text-lab-yellow-600" />
          </div>
        </div>

        {/* Add Staff Panel (search unassigned) */}
        {showAddPanel && (
          <div className="card-quicklab bg-white border border-lab-black-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-lab-black-900">Add Staff</h2>
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  setResult(null);
                  setQuery({ email: '', staffId: '' });
                }}
                className="text-lab-black-500 hover:text-lab-black-800"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-lab-black-600 mb-4">
              Search unassigned staff by email or Staff ID and add to your lab.
            </p>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                  By Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-lab-black-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. staff@example.com"
                    value={query.email}
                    onChange={(e) =>
                      setQuery((q) => ({ ...q, email: e.target.value, staffId: '' }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                  />
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                  Or Staff ID
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-lab-black-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Mongo ObjectId"
                    value={query.staffId}
                    onChange={(e) =>
                      setQuery((q) => ({ ...q, staffId: e.target.value, email: '' }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={!canSearch || searchLoading}
                  className="w-full btn-quicklab-primary py-2 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Result */}
            {result && (
              <div className="mt-6 border-t border-lab-black-100 pt-6">
                <h3 className="text-lg font-bold text-lab-black-900 mb-4">Result</h3>
                <div className="flex items-center justify-between card-quicklab bg-white border border-lab-black-100">
                  <div>
                    <p className="font-semibold text-lab-black-900">
                      {result.firstName} {result.lastName}
                    </p>
                    <p className="text-sm text-lab-black-600">{result.email}</p>
                    <p className="text-sm text-lab-black-600 capitalize">
                      Role: {result.role?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddStaff(result.id)}
                    disabled={adding}
                    className="btn-quicklab-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add to Lab'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Staff List */}
        <div className="card-quicklab bg-white border border-lab-black-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-lab-black-900">Your Staff</h2>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-lab-black-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                  placeholder="Search in your staff (name, email, ID)"
                  className="w-80 pl-10 pr-3 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                />
              </div>
              <span className="text-sm text-lab-black-600">{staffList.length} total</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-lab-black-100">
              <thead className="bg-lab-black-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-lab-black-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-lab-black-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-lab-black-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-lab-black-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-lab-black-100">
                {listLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-lab-black-600">
                      Loading staff...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-lab-black-600">
                      No matching staff.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-lab-yellow-50/50">
                      <td className="px-4 py-3 text-lab-black-900 font-medium">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3 text-lab-black-700">{s.userId?.email || '-'}</td>
                      <td className="px-4 py-3 text-lab-black-700 capitalize">
                        {s.role?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-lab-black-700">{s.phoneNumber || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveStaff(s._id)}
                          disabled={!!removingIds[s._id]}
                          className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
