import { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  FlaskConical,
  DollarSign,
  Clock,
  Home,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getLabInfo, addLabTest, updateLabTest } from '../../service/labAdminService';
import '../../quicklab.css';

export default function LabAdminManageTests() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testLabel: '',
    testCode: '',
    description: '',
    category: '',
    price: '',
    discountedPrice: '',
    preparationInstructions: '',
    sampleType: '',
    reportDeliveryTime: '',
    homeCollectionAvailable: false,
    requiresEquipment: false,
    equipmentDetails: '',
    isActive: true,
  });

  const testCategories = [
    { value: 'blood_test', label: 'Blood Test' },
    { value: 'urine_test', label: 'Urine Test' },
    { value: 'stool_test', label: 'Stool Test' },
    { value: 'imaging', label: 'Imaging (X-Ray, CT, MRI)' },
    { value: 'ecg', label: 'ECG' },
    { value: 'other', label: 'Other' },
  ];

  const sampleTypes = ['Blood', 'Urine', 'Stool', 'Saliva', 'Swab', 'Tissue', 'Other'];

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tests, searchQuery]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await getLabInfo();
      const data = response.data || response;
      setTests(data.lab?.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tests];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.testName?.toLowerCase().includes(query) ||
          test.testCode?.toLowerCase().includes(query) ||
          test.category?.toLowerCase().includes(query)
      );
    }

    setFilteredTests(filtered);
  };

  const handleOpenModal = (test = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        testName: test.testName || '',
        testCode: test.testCode || '',
        description: test.description || '',
        category: test.category || '',
        price: test.price || '',
        discountedPrice: test.discountedPrice || '',
        preparationInstructions: test.preparationInstructions || '',
        sampleType: test.sampleType || '',
        reportDeliveryTime: test.reportDeliveryTime || '',
        homeCollectionAvailable: test.homeCollectionAvailable || false,
        requiresEquipment: test.requiresEquipment || false,
        equipmentDetails: test.equipmentDetails || '',
        isActive: test.isActive !== false,
      });
    } else {
      setEditingTest(null);
      setFormData({
        testName: '',
        testCode: '',
        description: '',
        category: '',
        price: '',
        discountedPrice: '',
        preparationInstructions: '',
        sampleType: '',
        reportDeliveryTime: '',
        homeCollectionAvailable: false,
        requiresEquipment: false,
        equipmentDetails: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTest(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.testName || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTest) {
        await updateLabTest(editingTest._id, formData);
        toast.success('Test updated successfully');
      } else {
        await addLabTest(formData);
        toast.success('Test added successfully');
      }
      handleCloseModal();
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save test');
    }
  };

  const handleToggleActive = async (test) => {
    try {
      await updateLabTest(test._id, { isActive: !test.isActive });
      toast.success(`Test ${!test.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchTests();
    } catch (error) {
      toast.error('Failed to update test status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-white to-lab-black-50 dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 pt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50 mb-2">
              Manage Tests
            </h1>
            <p className="text-lab-black-600 dark:text-lab-black-400">
              Add, edit, and manage lab tests offered by your lab
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-quicklab-primary px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Test
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-4 mb-6 transition-colors">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lab-black-400 dark:text-lab-black-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test name, code, or category..."
              className="w-full pl-10 pr-4 py-2 border border-lab-black-300 dark:border-lab-black-600 rounded-lg bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-lab-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lab-black-600 dark:text-lab-black-400">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-12 text-center transition-colors">
            <FlaskConical className="w-16 h-16 text-lab-black-300 dark:text-lab-black-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-lab-black-900 dark:text-lab-black-50 mb-2">
              No tests found
            </h3>
            <p className="text-lab-black-600 dark:text-lab-black-400 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first test'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenModal()}
                className="btn-quicklab-primary px-6 py-2 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Test
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className={`bg-white dark:bg-lab-black-800 border rounded-lg p-6 transition-all hover:shadow-lg ${
                  test.isActive === false
                    ? 'border-red-300 dark:border-red-800 opacity-60'
                    : 'border-lab-black-200 dark:border-lab-black-700'
                }`}
              >
                {/* Test Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50 mb-1">
                      {test.testName}
                    </h3>
                    {test.testCode && (
                      <p className="text-sm text-lab-black-500 dark:text-lab-black-400">
                        Code: {test.testCode}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(test)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit Test"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(test)}
                      className={`p-2 rounded-lg transition-colors ${
                        test.isActive === false
                          ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={test.isActive === false ? 'Activate' : 'Deactivate'}
                    >
                      {test.isActive === false ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                {test.isActive === false && (
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full">
                      Inactive
                    </span>
                  </div>
                )}

                {/* Category */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-lab-yellow-100 dark:bg-lab-yellow-900/30 text-lab-yellow-800 dark:text-lab-yellow-400 text-sm font-medium rounded-full">
                    {test.category?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>

                {/* Description */}
                {test.description && (
                  <p className="text-sm text-lab-black-600 dark:text-lab-black-400 mb-4 line-clamp-2">
                    {test.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-lab-yellow-600 dark:text-lab-yellow-500" />
                  <span className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                    ₹{test.price}
                  </span>
                  {test.discountedPrice && test.discountedPrice < test.price && (
                    <span className="text-sm text-lab-black-500 dark:text-lab-black-400 line-through">
                      ₹{test.discountedPrice}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {test.sampleType && (
                    <div className="flex items-center gap-2 text-sm text-lab-black-600 dark:text-lab-black-400">
                      <FlaskConical className="w-4 h-4" />
                      <span>Sample: {test.sampleType}</span>
                    </div>
                  )}
                  {test.reportDeliveryTime && (
                    <div className="flex items-center gap-2 text-sm text-lab-black-600 dark:text-lab-black-400">
                      <Clock className="w-4 h-4" />
                      <span>Report: {test.reportDeliveryTime}</span>
                    </div>
                  )}
                  {test.homeCollectionAvailable && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Home className="w-4 h-4" />
                      <span>Home Collection Available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-lab-black-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-lab-black-800 border-b border-lab-black-200 dark:border-lab-black-700 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
                {editingTest ? 'Edit Test' : 'Add New Test'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-lab-black-500 dark:text-lab-black-400 hover:text-lab-black-800 dark:hover:text-lab-black-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Test Label (e.g., "Quick Check", "Comprehensive")
                  </label>
                  <input
                    type="text"
                    name="testLabel"
                    value={formData.testLabel || ''}
                    onChange={handleInputChange}
                    placeholder="Optional label for display"
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Test Code
                  </label>
                  <input
                    type="text"
                    name="testCode"
                    value={formData.testCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Category</option>
                    {testCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Sample Type
                  </label>
                  <select
                    name="sampleType"
                    value={formData.sampleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Sample Type</option>
                    {sampleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                    Report Delivery Time
                  </label>
                  <input
                    type="text"
                    name="reportDeliveryTime"
                    value={formData.reportDeliveryTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 24 hours, 2-3 days"
                    className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Preparation Instructions */}
              <div>
                <label className="block text-sm font-medium text-lab-black-900 dark:text-lab-black-50 mb-2">
                  Preparation Instructions
                </label>
                <textarea
                  name="preparationInstructions"
                  value={formData.preparationInstructions}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g., Fasting required for 8-12 hours"
                  className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="homeCollectionAvailable"
                    checked={formData.homeCollectionAvailable}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-lab-yellow-600 border-lab-black-300 dark:border-lab-black-600 rounded focus:ring-lab-yellow-500"
                  />
                  <span className="text-sm font-medium text-lab-black-900 dark:text-lab-black-50">
                    Home Collection Available
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresEquipment"
                    checked={formData.requiresEquipment}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-lab-yellow-600 border-lab-black-300 dark:border-lab-black-600 rounded focus:ring-lab-yellow-500"
                  />
                  <span className="text-sm font-medium text-lab-black-900 dark:text-lab-black-50">
                    Requires Special Equipment
                  </span>
                </label>

                {formData.requiresEquipment && (
                  <div className="ml-8">
                    <input
                      type="text"
                      name="equipmentDetails"
                      value={formData.equipmentDetails}
                      onChange={handleInputChange}
                      placeholder="Specify equipment details"
                      className="w-full px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-lab-yellow-600 border-lab-black-300 dark:border-lab-black-600 rounded focus:ring-lab-yellow-500"
                  />
                  <span className="text-sm font-medium text-lab-black-900 dark:text-lab-black-50">
                    Active (Available for booking)
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-lab-black-200 dark:border-lab-black-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-700 dark:text-lab-black-300 rounded-lg hover:bg-lab-black-50 dark:hover:bg-lab-black-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-quicklab-primary px-6 py-3 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingTest ? 'Update Test' : 'Add Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
