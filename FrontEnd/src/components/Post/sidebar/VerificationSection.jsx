import React, { useState, useEffect } from 'react';
import { submitVerification, getVerificationStatus } from '../../../services/api';

export default function VerificationSection({ user, selectedProfession }) {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Load verification status
  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const response = await getVerificationStatus();
      console.log('📋 Full API response:', response);
      console.log('📋 Response data:', response.data);
      // API returns { success: true, data: { ... } } so we need response.data.data
      const statusData = response.data?.data || response.data;
      console.log('📋 Status data:', statusData);
      setVerificationStatus(statusData);
    } catch (err) {
      console.error('Failed to load verification status:', err);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      if (type === 'front') {
        setIdCardFront(file);
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setIdCardBack(file);
        setBackPreview(URL.createObjectURL(file));
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedProfession) {
      setError('Please select your profession first');
      return;
    }

    if (!idCardFront) {
      setError('Please upload front side of your ID card');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_type', selectedProfession);
      formData.append('id_card_front', idCardFront);
      
      if (idCardBack) {
        formData.append('id_card_back', idCardBack);
      }
      
      if (institutionalEmail) {
        formData.append('institutional_email', institutionalEmail);
      }

      const response = await submitVerification(formData);
      setSuccess('Verification request submitted successfully! Admin will review it soon.');
      
      // Reload verification status
      setTimeout(() => {
        loadVerificationStatus();
        setIdCardFront(null);
        setIdCardBack(null);
        setFrontPreview(null);
        setBackPreview(null);
        setInstitutionalEmail('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Pending Review' },
      approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Verified ✓' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // If user is already verified
  if (user?.is_verified) {
    return (
      <div className="bg-white/[0.04] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <i className="fi fi-br-shield-check text-green-400 text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-white">Account Verification</h2>
          </div>
          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold border border-green-500/30 flex items-center gap-2">
            <i className="fi fi-br-check-circle"></i>
            Verified
          </span>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm flex items-center gap-2">
            <i className="fi fi-br-badge-check"></i>
            Your account is verified. You can create posts and make purchases.
          </p>
        </div>
      </div>
    );
  }

  // If there's a pending or recent verification
  if (verificationStatus && verificationStatus.has_verification && verificationStatus.status && verificationStatus.status !== 'rejected') {
    // Format the submitted date safely
    const formatDate = (dateString) => {
      if (!dateString) return 'Recently';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recently';
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (e) {
        return 'Recently';
      }
    };

    return (
      <div className="bg-white/[0.04] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <i className="fi fi-br-hourglass text-yellow-400 text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-white">Account Verification</h2>
          </div>
          {getStatusBadge(verificationStatus.status)}
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 space-y-3">
          <p className="text-yellow-400 text-sm flex items-center gap-2">
            <i className="fi fi-br-info"></i>
            Your verification request is under review by our admin team.
          </p>
          <div className="text-text-muted text-sm space-y-1">
            <p><strong>Submitted:</strong> {formatDate(verificationStatus.submitted_at || verificationStatus.created_at)}</p>
            {verificationStatus.admin_notes && (
              <p><strong>Admin Notes:</strong> {verificationStatus.admin_notes}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Verification form
  return (
    <div className="bg-white/[0.04] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <i className="fi fi-br-shield-exclamation text-red-400 text-lg"></i>
          </div>
          <h2 className="text-xl font-bold text-white">Account Verification Required</h2>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <i className="fi fi-br-exclamation text-red-400 text-lg mt-0.5"></i>
          <div className="text-sm text-red-300 space-y-2">
            <p className="font-semibold">Verification is required to access full features</p>
            <p className="text-text-muted">Without verification, you cannot:</p>
            <ul className="list-disc list-inside space-y-1 text-text-muted">
              <li>Create or share posts</li>
              <li>Make purchases or subscribe to premium</li>
            </ul>
            <p className="text-text-muted">You can still send and receive messages.</p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profession Check */}
        {!selectedProfession && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <i className="fi fi-br-info"></i>
              Please select your profession in the Profile Information section above first.
            </p>
          </div>
        )}

        {/* Institutional Email (Optional) */}
        {selectedProfession && (
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Institutional Email (Optional)
              <span className="text-text-muted/60 ml-2">- If you have one</span>
            </label>
            <input
              type="email"
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              placeholder="student@university.edu or teacher@school.edu"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
            />
          </div>
        )}

        {/* ID Card Front */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            ID Card (Front) <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-text-muted mb-3">
            Upload a clear photo of your Student ID, National ID, or Employee ID (front side)
          </p>
          <div className="relative">
            <input
              type="file"
              id="id_card_front"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'front')}
              className="hidden"
              disabled={!selectedProfession || loading}
            />
            <label
              htmlFor="id_card_front"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                frontPreview
                  ? 'border-primary-teal bg-primary-teal/5'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              } ${!selectedProfession || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {frontPreview ? (
                <div className="relative w-full h-full p-2">
                  <img src={frontPreview} alt="ID Front" className="w-full h-full object-contain rounded" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIdCardFront(null);
                      setFrontPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <i className="fi fi-br-cross text-xs"></i>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <i className="fi fi-br-cloud-upload text-primary-teal text-3xl mb-3"></i>
                  <p className="text-white font-medium mb-1">Click to upload ID front</p>
                  <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* ID Card Back (Optional) */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            ID Card (Back) - Optional
          </label>
          <p className="text-xs text-text-muted mb-3">
            Upload back side if it contains important information
          </p>
          <div className="relative">
            <input
              type="file"
              id="id_card_back"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'back')}
              className="hidden"
              disabled={!selectedProfession || loading}
            />
            <label
              htmlFor="id_card_back"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                backPreview
                  ? 'border-primary-teal bg-primary-teal/5'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              } ${!selectedProfession || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {backPreview ? (
                <div className="relative w-full h-full p-2">
                  <img src={backPreview} alt="ID Back" className="w-full h-full object-contain rounded" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIdCardBack(null);
                      setBackPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <i className="fi fi-br-cross text-xs"></i>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <i className="fi fi-br-cloud-upload text-text-muted text-3xl mb-3"></i>
                  <p className="text-text-muted font-medium mb-1">Click to upload ID back</p>
                  <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedProfession || !idCardFront}
          className="w-full py-3 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <i className="fi fi-br-paper-plane"></i>
              Submit for Verification
            </>
          )}
        </button>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
            <i className="fi fi-br-cross-circle"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
            <i className="fi fi-br-check-circle"></i>
            {success}
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <i className="fi fi-br-bulb"></i>
            Tips for successful verification:
          </h4>
          <ul className="text-text-muted text-xs space-y-1.5 ml-6 list-disc">
            <li>Take photos in good lighting conditions</li>
            <li>Ensure all text on ID is clearly readable</li>
            <li>Avoid glare, shadows, or blurriness</li>
            <li>Make sure the entire ID fits in the photo</li>
            <li>Use institutional email if available (increases approval chances)</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
