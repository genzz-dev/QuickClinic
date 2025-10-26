import { Star, Trash2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  createRating,
  deleteRating,
  getClinicRatings,
  getDoctorRatings,
  updateRating,
} from '../../service/ratingApiService';

const RatingComponent = ({ appointmentId, doctorId, clinicId, onRatingUpdate }) => {
  const [doctorRating, setDoctorRating] = useState(null);
  const [clinicRating, setClinicRating] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [editingClinic, setEditingClinic] = useState(false);

  const [doctorFormData, setDoctorFormData] = useState({ rating: 0, comment: '' });
  const [clinicFormData, setClinicFormData] = useState({ rating: 0, comment: '' });
  const [hoveredDoctorStar, setHoveredDoctorStar] = useState(0);
  const [hoveredClinicStar, setHoveredClinicStar] = useState(0);
  const [loading, setLoading] = useState({ doctor: false, clinic: false });
  const [error, setError] = useState({ doctor: null, clinic: null });

  useEffect(() => {
    fetchExistingRatings();
  }, [appointmentId, doctorId, clinicId]);

  const fetchExistingRatings = async () => {
    try {
      if (doctorId) {
        const doctorRatingsResponse = await getDoctorRatings(doctorId);
        const doctorRatings = doctorRatingsResponse.ratings || doctorRatingsResponse.data || [];
        const existingDoctorRating = doctorRatings.find(
          (r) =>
            (r.appointmentId?._id === appointmentId || r.appointmentId === appointmentId) &&
            r.ratingType === 'doctor'
        );
        if (existingDoctorRating) {
          setDoctorRating(existingDoctorRating);
          setDoctorFormData({
            rating: existingDoctorRating.rating || 0,
            comment: existingDoctorRating.comment || '',
          });
        }
      }

      if (clinicId) {
        const clinicRatingsResponse = await getClinicRatings(clinicId);
        const clinicRatings = clinicRatingsResponse.ratings || clinicRatingsResponse.data || [];
        const existingClinicRating = clinicRatings.find(
          (r) =>
            (r.appointmentId?._id === appointmentId || r.appointmentId === appointmentId) &&
            r.ratingType === 'clinic'
        );
        if (existingClinicRating) {
          setClinicRating(existingClinicRating);
          setClinicFormData({
            rating: existingClinicRating.rating || 0,
            comment: existingClinicRating.comment || '',
          });
        }
      }
    } catch (err) {
      console.log('Error fetching existing ratings:', err);
    }
  };

  const handleSubmitRating = async (type) => {
    const isDoctor = type === 'doctor';
    const formData = isDoctor ? doctorFormData : clinicFormData;
    const existingRating = isDoctor ? doctorRating : clinicRating;

    if (formData.rating === 0) {
      setError((prev) => ({ ...prev, [type]: 'Please select a rating' }));
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setError((prev) => ({ ...prev, [type]: null }));

      const ratingData = {
        appointmentId,
        rating: formData.rating,
        comment: formData.comment.trim(),
        ratingType: type,
        doctorId: isDoctor ? doctorId : undefined,
        clinicId: !isDoctor ? clinicId : undefined,
      };

      let response;
      if (existingRating && existingRating._id) {
        response = await updateRating(existingRating._id, ratingData);
      } else {
        response = await createRating(ratingData);
      }

      const newRating = response.rating || response.data;
      if (isDoctor) {
        setDoctorRating(newRating);
        setEditingDoctor(false);
      } else {
        setClinicRating(newRating);
        setEditingClinic(false);
      }

      if (onRatingUpdate) onRatingUpdate(type, newRating);
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [type]: err.response?.data?.message || 'Failed to submit rating',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDeleteRating = async (type) => {
    const rating = type === 'doctor' ? doctorRating : clinicRating;
    if (!window.confirm('Delete this rating?')) return;

    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      await deleteRating(rating._id);

      if (type === 'doctor') {
        setDoctorRating(null);
        setDoctorFormData({ rating: 0, comment: '' });
        setEditingDoctor(true);
      } else {
        setClinicRating(null);
        setClinicFormData({ rating: 0, comment: '' });
        setEditingClinic(true);
      }

      if (onRatingUpdate) onRatingUpdate(type, null);
    } catch (err) {
      setError((prev) => ({ ...prev, [type]: 'Failed to delete rating' }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleCancel = (type) => {
    const existingRating = type === 'doctor' ? doctorRating : clinicRating;
    if (existingRating) {
      if (type === 'doctor') {
        setDoctorFormData({
          rating: existingRating.rating || 0,
          comment: existingRating.comment || '',
        });
        setEditingDoctor(false);
      } else {
        setClinicFormData({
          rating: existingRating.rating || 0,
          comment: existingRating.comment || '',
        });
        setEditingClinic(false);
      }
    } else {
      if (type === 'doctor') {
        setDoctorFormData({ rating: 0, comment: '' });
      } else {
        setClinicFormData({ rating: 0, comment: '' });
      }
    }
    setError((prev) => ({ ...prev, [type]: null }));
  };

  const renderStars = (value, hoveredValue, onHover, onClick, isEditing) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => isEditing && onClick(star)}
          onMouseEnter={() => isEditing && onHover(star)}
          onMouseLeave={() => isEditing && onHover(0)}
          disabled={!isEditing}
          className={`transition-colors ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hoveredValue || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderRatingSection = (
    type,
    rating,
    formData,
    setFormData,
    editing,
    setEditing,
    hoveredStar,
    setHoveredStar
  ) => {
    const isEditing = editing || !rating;

    return (
      <div className="space-y-3">
        {/* Title with underline - Same as DoctorClinicInfo */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-900">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Rate {type}
          </h4>
          {rating && !editing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteRating(type)}
                disabled={loading[type]}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stars */}
        <div>
          {renderStars(
            formData.rating,
            hoveredStar,
            setHoveredStar,
            (value) => setFormData((prev) => ({ ...prev, rating: value })),
            isEditing
          )}
        </div>

        {/* Comment */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience (optional)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent resize-none"
            />
            {error[type] && <p className="text-xs text-red-600">{error[type]}</p>}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSubmitRating(type)}
                disabled={loading[type]}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                <span>{loading[type] ? 'Saving...' : 'Submit'}</span>
              </button>
              {rating && (
                <button
                  onClick={() => handleCancel(type)}
                  disabled={loading[type]}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {formData.comment && (
              <p className="text-sm text-gray-700 leading-relaxed">{formData.comment}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Doctor Rating */}
      {renderRatingSection(
        'doctor',
        doctorRating,
        doctorFormData,
        setDoctorFormData,
        editingDoctor,
        setEditingDoctor,
        hoveredDoctorStar,
        setHoveredDoctorStar
      )}

      {/* Clinic Rating */}
      {renderRatingSection(
        'clinic',
        clinicRating,
        clinicFormData,
        setClinicFormData,
        editingClinic,
        setEditingClinic,
        hoveredClinicStar,
        setHoveredClinicStar
      )}
    </div>
  );
};

export default RatingComponent;
