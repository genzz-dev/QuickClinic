import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { checkStaffProfileExists } from '../../service/labStaffService';
import '../../quicklab.css';
import { Copy, CheckCircle, Clock } from 'lucide-react';

export default function LabStaffWaitingForAssignment() {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await checkStaffProfileExists();
        setStaffId(res.staffId);
        setIsAssigned(res.isAssignedToLab);
        setLoading(false);

        // Poll every 5 seconds to check if assigned
        if (!res.isAssignedToLab) {
          const interval = setInterval(async () => {
            const updated = await checkStaffProfileExists();
            if (updated.isAssignedToLab) {
              setIsAssigned(true);
              window.location.href = '/quick-lab/staff-dashboard';
            }
          }, 5000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking staff status:', error);
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleCopyId = () => {
    if (staffId) {
      navigator.clipboard.writeText(staffId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white flex items-center justify-center p-4 pt-20">
        <div className="card-quicklab bg-white text-center">
          <p className="text-lab-black-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAssigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white flex items-center justify-center p-4 pt-20">
        <div className="card-quicklab bg-white max-w-md text-center">
          <div className="mb-4">
            <CheckCircle size={48} className="text-lab-yellow-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-lab-black-900 mb-2">Assignment Confirmed!</h2>
          <p className="text-lab-black-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8 pt-20">
      <div className="max-w-md mx-auto">
        <div className="card-quicklab bg-white">
          <div className="text-center mb-8">
            <Clock size={48} className="text-lab-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-lab-black-900 mb-2">Waiting for Assignment</h1>
            <p className="text-lab-black-600">Share your Staff ID with your Lab Admin</p>
          </div>

          <div className="bg-lab-yellow-50 border-2 border-lab-yellow-300 rounded-lg p-6 mb-6">
            <p className="text-sm font-semibold text-lab-black-600 mb-3 text-center">
              Your Staff ID
            </p>
            <div className="flex items-center justify-between bg-white border-2 border-lab-yellow-400 rounded-lg p-4">
              <span className="font-mono text-lg font-bold text-lab-black-900 break-all">
                {staffId}
              </span>
              <button
                onClick={handleCopyId}
                className="ml-2 p-2 hover:bg-lab-yellow-100 rounded-lg transition"
                title="Copy ID"
              >
                {copied ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-lab-yellow-600" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-center text-sm text-green-600 font-medium mt-3">
                Copied to clipboard!
              </p>
            )}
          </div>

          <div className="mb-8 p-4 bg-lab-black-50 rounded-lg">
            <h3 className="font-bold text-lab-black-900 mb-3">What's Next?</h3>
            <ol className="space-y-2 text-sm text-lab-black-700">
              <li className="flex gap-3">
                <span className="font-bold text-lab-yellow-600">1.</span>
                <span>Copy your Staff ID using the button above</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-lab-yellow-600">2.</span>
                <span>Share this ID with your Lab Admin</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-lab-yellow-600">3.</span>
                <span>The Lab Admin will add you to their lab</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-lab-yellow-600">4.</span>
                <span>Once added, you'll be redirected to your dashboard</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-center gap-3 text-lab-black-600">
            <div className="w-3 h-3 bg-lab-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Waiting for assignment...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
