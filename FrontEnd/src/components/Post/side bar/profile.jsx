import React, { useState, useEffect } from "react";
import { 
  createOrUpdateTeacherProfile, 
  createOrUpdateStudentProfile, 
  createOrUpdateEmployeeProfile,
  getMyTeacherProfile,
  getMyStudentProfile,
  getMyEmployeeProfile,
  deleteAccount
} from "../../../services/api";
import { useNavigate } from 'react-router-dom';

const Switcher8 = ({ isChecked, onChange }) => {
  return (
    <label className='flex cursor-pointer select-none items-center group'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onChange}
          className='sr-only'
        />
        <div
          className={`h-6 w-11 rounded-full transition-all duration-300 ease-in-out ${
            isChecked 
              ? 'bg-gradient-to-r from-primary-teal to-blue-500 shadow-lg shadow-primary-teal/30' 
              : 'bg-white/10 border border-white/20'
          }`}
        ></div>
        <div
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out transform ${
            isChecked ? 'translate-x-5' : 'translate-x-0'
          } group-hover:scale-110`}
        ></div>
      </div>
    </label>
  );
};

export default function Profile({ onBack }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState('editing'); // 'editing' or 'saved'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    websiteUrl: "",
    gender: "",
    coverPicUrl: "",
    profilePicUrl: "",
  });

  const [interests, setInterests] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: false,
    showEmail: false,
    allowMessages: false,
    showOnlineStatus: false,
  });

  // Load user data on mount and auto-detect profession
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData(prev => ({
        ...prev,
        fullName: parsedUser.full_name || "",
        email: parsedUser.email || "",
        username: parsedUser.username || "",
        profilePicUrl: parsedUser.profile_picture || "", // Load profile picture from localStorage
      }));
      
      // Auto-load profession if user has one saved
      if (parsedUser.profession) {
        setSelectedProfession(parsedUser.profession.toLowerCase());
      }
    }
  }, []);

  // Load profile based on profession
  const loadProfile = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedProfession === "teacher") {
        response = await getMyTeacherProfile();
      } else if (selectedProfession === "student") {
        response = await getMyStudentProfile();
      } else if (selectedProfession === "employee") {
        response = await getMyEmployeeProfile();
      }

      if (response?.data?.success && response.data.data) {
        const profile = response.data.data;
        setProfileData(prev => ({
          ...prev,
          fullName: profile.fullName || profile.user?.full_name || prev.fullName,
          username: profile.username || "",
          email: profile.user?.email || prev.email,
          phone: profile.phone || "",
          bio: profile.bio || "",
          location: profile.location || "",
          websiteUrl: profile.websiteUrl || "",
          gender: profile.gender || "",
          coverPicUrl: profile.coverPicUrl || "",
          profilePicUrl: profile.profilePicUrl || profile.user?.profile_picture || "",
        }));
        setInterests(profile.interests || []);
        setEducation(profile.education || []);
        setSkills(profile.professionalSkills || []);
        setCertificates(profile.certificates || []);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Load profile error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-load profile when profession is set (including from localStorage)
  useEffect(() => {
    if (selectedProfession) {
      loadProfile();
    }
  }, [selectedProfession]);

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!selectedProfession) {
        setError("Please select your profession first");
        return;
      }

      if (!profileData.username) {
        setError("Username is required");
        return;
      }

      if (!profileData.fullName) {
        setError("Full name is required");
        return;
      }

      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        username: profileData.username,
        fullName: profileData.fullName,
        phone: profileData.phone || '',
        profilePicUrl: profileData.profilePicUrl || '', // Use profile picture from profileData state
        bio: profileData.bio,
        location: profileData.location,
        websiteUrl: profileData.websiteUrl,
        gender: profileData.gender,
        coverPicUrl: profileData.coverPicUrl || '',
        interests,
        education,
        professionalSkills: skills,
        certificates,
      };

      console.log("Saving profile with payload:", payload);

      let response;
      if (selectedProfession === "teacher") {
        payload.profession = "Teacher";
        response = await createOrUpdateTeacherProfile(payload);
      } else if (selectedProfession === "student") {
        response = await createOrUpdateStudentProfile(payload);
      } else if (selectedProfession === "employee") {
        response = await createOrUpdateEmployeeProfile(payload);
      }

      console.log("Profile save response:", response);

      if (response?.data?.success) {
        setSuccess(response.data.message || "Profile saved successfully!");
        setViewMode('saved');
        setHasUnsavedChanges(false);
        setEditingSection(null);
        
        // Update localStorage with user data from backend response (includes saved profile_picture)
        const savedUserData = response.data.data?.user;
        const updatedUser = {
          ...currentUser,
          full_name: savedUserData?.full_name || profileData.fullName,
          username: savedUserData?.username || profileData.username,
          profession: savedUserData?.profession || (selectedProfession.charAt(0).toUpperCase() + selectedProfession.slice(1)),
          profile_picture: savedUserData?.profile_picture || currentUser.profile_picture, // Use profile picture from backend response
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Dispatch custom event to notify other components (like Sidebar) that user data updated
        window.dispatchEvent(new Event('userUpdated'));
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || "Failed to save profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing && hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Discard them?')) {
        return;
      }
      loadProfile(); // Reload original data
      setHasUnsavedChanges(false);
    }
  };

  // Save specific section
  const handleSaveSection = async (sectionName) => {
    try {
      setLoading(true);
      await handleSaveProfile();
      setEditingSection(null);
      setHasUnsavedChanges(false);
      setSuccess(`${sectionName} updated successfully!`);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(`Failed to save ${sectionName}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing specific section
  const handleCancelEdit = (sectionName) => {
    if (hasUnsavedChanges && !window.confirm('Discard changes?')) {
      return;
    }
    setEditingSection(null);
    setHasUnsavedChanges(false);
    loadProfile();
  };

  // Enable edit mode from saved view
  const handleEnableEdit = () => {
    setViewMode('editing');
    setEditingSection('profile-info');
  };

  // Handle interest toggle
  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Handle skill addition
  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills(prev => [...prev, skill]);
      setHasUnsavedChanges(true);
    }
  };

  // Handle skill removal
  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
    setHasUnsavedChanges(true);
  };

  // Handle cover photo upload
  const handleCoverPhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleInputChange('coverPicUrl', event.target.result);
          setSuccess('Cover photo updated! Remember to save changes.');
          setTimeout(() => setSuccess(''), 3000);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle profile picture upload
  const handleProfilePicUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Store in profileData state like cover photo
          handleInputChange('profilePicUrl', event.target.result);
          setSuccess('Profile picture updated! Remember to save changes.');
          setTimeout(() => setSuccess(''), 3000);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle add education
  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now(),
      type: '',
      institution: '',
      degree: '',
      yearRange: ''
    };
    setEducation(prev => [...prev, newEducation]);
  };

  // Handle update education
  const handleUpdateEducation = (id, field, value) => {
    setEducation(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  // Handle remove education
  const handleRemoveEducation = (id) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
  };

  // Handle add certificate
  const handleAddCertificate = () => {
    const newCert = {
      id: Date.now(),
      name: '',
      organization: '',
      issueDate: '',
      certificateId: ''
    };
    setCertificates(prev => [...prev, newCert]);
  };

  // Handle update certificate
  const handleUpdateCertificate = (id, field, value) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  // Handle remove certificate
  const handleRemoveCertificate = (id) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
  };

  // Handle account update
  const handleUpdateAccount = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('Account settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update account settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Sending delete account request...");
      const response = await deleteAccount({ password: deletePassword });
      console.log("Delete account response:", response.data);
      
      if (response.data.success) {
        setSuccess("Account deleted successfully. Redirecting...");
        setShowDeleteModal(false);
        setDeletePassword("");
        
        // Clear all local storage
        localStorage.clear();
        
        // Wait 2 seconds then redirect to login
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      console.error("Delete account error:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to delete account. Please try again.";
      setError(errorMessage);
      setShowDeleteModal(false);
      setDeletePassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Centered Container */}
      <div className="w-full h-full max-w-6xl flex flex-col">
        {/* Header with back button */}
        <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fi fi-br-arrow-left text-white text-xl"></i>
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Profile</h2>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/[0.04] rounded-xl overflow-hidden mb-6">
          {/* Cover Photo */}
          <div 
            className="relative h-48 bg-gradient-to-r from-primary-teal to-blue-500"
            style={profileData.coverPicUrl ? { backgroundImage: `url(${profileData.coverPicUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <button 
              onClick={handleCoverPhotoUpload}
              className="absolute top-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <i className="fi fi-br-camera text-white"></i>
            </button>
          </div>

          {/* Profile Info */}
          <div className="p-6 pt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-8">
              <div className="relative">
                {profileData.profilePicUrl ? (
                  <img 
                    src={profileData.profilePicUrl} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full object-cover border-4 border-black"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-teal to-blue-500 flex items-center justify-center font-bold text-white text-4xl border-4 border-black">
                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <button 
                  onClick={handleProfilePicUpload}
                  className="absolute bottom-0 right-0 h-10 w-10 bg-primary-teal rounded-full flex items-center justify-center hover:bg-primary-blue transition-colors border-2 border-black"
                >
                  <i className="fi fi-br-camera text-white"></i>
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{profileData.fullName || 'Your Name'}</h1>
                <p className="text-text-muted mb-3">@{profileData.username || 'your_handle'}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-text-muted"><span className="text-white font-semibold">125</span> Following</span>
                  <span className="text-text-muted"><span className="text-white font-semibold">1.2K</span> Followers</span>
                </div>
              </div>
            </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {["profile", "account", "privacy"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-primary-teal border-b-2 border-primary-teal"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-teal/20 rounded-lg flex items-center justify-center">
                    <i className="fi fi-br-user text-primary-teal text-lg"></i>
                  </div>
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                </div>
                {editingSection === 'profile-info' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelEdit('Profile Information')}
                      type="button"
                      className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('Profile Information')}
                      type="button"
                      disabled={loading}
                      className="px-5 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fi fi-br-check"></i>
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('profile-info')}
                    type="button"
                    className="px-4 py-2 text-primary-teal hover:bg-primary-teal/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <i className="fi fi-br-pencil"></i>
                    Edit
                  </button>
                )}
              </div>
              {editingSection === 'profile-info' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="your_handle"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Profession
                      </label>
                      <select 
                        value={selectedProfession}
                        onChange={(e) => setSelectedProfession(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-teal transition-all"
                      >
                        <option value="" className="bg-black">Select profession</option>
                        <option value="student" className="bg-black">Student</option>
                        <option value="teacher" className="bg-black">Teacher</option>
                        <option value="employee" className="bg-black">Employee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Gender
                      </label>
                      <select 
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-teal transition-all"
                      >
                        <option value="" className="bg-black">Select gender</option>
                        <option value="Male" className="bg-black">Male</option>
                        <option value="Female" className="bg-black">Female</option>
                        <option value="Other" className="bg-black">Other</option>
                        <option value="Prefer not to say" className="bg-black">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Full Name</p>
                      <p className="text-white font-medium">{profileData.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Username</p>
                      <p className="text-white font-medium">@{profileData.username || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Profession</p>
                      <p className="text-white font-medium capitalize">{selectedProfession || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Gender</p>
                      <p className="text-white font-medium">{profileData.gender || '—'}</p>
                    </div>
                    {profileData.location && (
                      <div>
                        <p className="text-sm text-text-muted mb-1">Location</p>
                        <p className="text-white font-medium">{profileData.location}</p>
                      </div>
                    )}
                    {profileData.websiteUrl && (
                      <div>
                        <p className="text-sm text-text-muted mb-1">Website</p>
                        <a href={profileData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary-teal hover:text-blue-400 font-medium break-all">
                          {profileData.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                  {profileData.bio && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-sm text-text-muted mb-2">Bio</p>
                      <p className="text-white leading-relaxed">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-teal/20 rounded-lg flex items-center justify-center">
                    <i className="fi fi-br-heart text-primary-teal text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Interests</h2>
                    {interests.length > 0 && (
                      <p className="text-sm text-text-muted">{interests.length} selected</p>
                    )}
                  </div>
                </div>
                {editingSection === 'interests' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelEdit('Interests')}
                      type="button"
                      className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('Interests')}
                      type="button"
                      disabled={loading}
                      className="px-5 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fi fi-br-check"></i>
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('interests')}
                    type="button"
                    className="px-4 py-2 text-primary-teal hover:bg-primary-teal/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <i className="fi fi-br-pencil"></i>
                    Edit
                  </button>
                )}
              </div>

              {editingSection === 'interests' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Projects",
                    "Research Paper",
                    "Thesis",
                    "Team Project",
                    "Individual Work",
                    "Freelance",
                    "Internship",
                    "Part-time Job",
                    "Collaboration"
                  ].map((interest) => (
                    <label key={interest} className="relative flex items-center gap-2.5 cursor-pointer group p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary-teal transition-all">
                      <input
                        type="checkbox"
                        checked={interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="w-4 h-4 rounded border-white/30 bg-transparent checked:bg-primary-teal checked:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer accent-primary-teal"
                      />
                      <span className="text-sm font-medium text-white select-none">
                        {interest}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <span key={interest} className="px-4 py-2 bg-primary-teal/10 text-primary-teal rounded-lg text-sm font-medium border border-primary-teal/20">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fi fi-br-heart text-text-muted text-xl"></i>
                      </div>
                      <p className="text-text-muted text-sm">No interests selected yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-teal/20 rounded-lg flex items-center justify-center">
                    <i className="fi fi-br-graduation-cap text-primary-teal text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Education</h2>
                    {education.length > 0 && (
                      <p className="text-sm text-text-muted">{education.length} institution{education.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
                {editingSection === 'education' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelEdit('Education')}
                      type="button"
                      className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('Education')}
                      type="button"
                      disabled={loading}
                      className="px-5 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fi fi-br-check"></i>
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('education')}
                    type="button"
                    className="px-4 py-2 text-primary-teal hover:bg-primary-teal/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <i className="fi fi-br-pencil"></i>
                    Edit
                  </button>
                )}
              </div>

              {editingSection === 'education' ? (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="p-5 bg-black/50 border border-white/10 rounded-lg">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select 
                            value={edu.type}
                            onChange={(e) => handleUpdateEducation(edu.id, 'type', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-teal transition-all"
                          >
                            <option value="" className="bg-black">Institution Type</option>
                            <option value="school" className="bg-black">School</option>
                            <option value="college" className="bg-black">College</option>
                            <option value="university" className="bg-black">University</option>
                          </select>
                          <input
                            type="text"
                            value={edu.yearRange}
                            onChange={(e) => handleUpdateEducation(edu.id, 'yearRange', e.target.value)}
                            placeholder="Year Range (e.g., 2020-2024)"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                          />
                        </div>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Institution Name"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Degree/Field of Study"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                        />
                        <button 
                          onClick={() => handleRemoveEducation(edu.id)}
                          type="button"
                          className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <i className="fi fi-br-trash text-sm"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={handleAddEducation}
                    type="button"
                    className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-text-muted hover:text-white hover:border-primary-teal/50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <i className="fi fi-br-plus"></i>
                    Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {education.length > 0 ? education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex gap-3">
                        <div className="h-11 w-11 bg-primary-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fi fi-br-graduation-cap text-primary-teal"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 truncate">{edu.institution || 'Institution'}</h3>
                          <p className="text-sm text-text-muted mb-1">{edu.degree || 'Degree'}</p>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="capitalize">{edu.type || 'Type'}</span>
                            {edu.yearRange && (
                              <>
                                <span>•</span>
                                <span>{edu.yearRange}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fi fi-br-graduation-cap text-text-muted text-2xl"></i>
                      </div>
                      <p className="text-text-muted text-sm">No education added yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Professional Skills */}
            {!selectedProfession && (
              <div className="bg-gradient-to-r from-blue-500/10 to-primary-teal/10 rounded-xl p-8 border border-primary-teal/30 text-center">
                <div className="h-16 w-16 bg-primary-teal/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary-teal/50">
                  <i className="fi fi-br-briefcase text-primary-teal text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Select Your Profession</h3>
                <p className="text-text-muted max-w-md mx-auto">
                  Choose your profession above to unlock relevant professional skills and showcase your expertise
                </p>
              </div>
            )}

            {selectedProfession && (
              <div className="bg-white/[0.04] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary-teal/20 rounded-lg flex items-center justify-center">
                      <i className="fi fi-br-sparkles text-primary-teal text-lg"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Professional Skills</h2>
                      {skills.length > 0 && (
                        <p className="text-sm text-text-muted">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                  {editingSection === 'skills' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCancelEdit('skills')}
                        type="button"
                        className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveSection('Skills')}
                        disabled={loading}
                        type="button"
                        className="px-5 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fi fi-br-check"></i>
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setEditingSection('skills')}
                      type="button"
                      className="px-4 py-2 text-primary-teal hover:bg-primary-teal/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <i className="fi fi-br-pencil"></i>
                      Edit
                    </button>
                  )}
                </div>

                {editingSection === 'skills' ? (
                  // Edit Mode
                  <div className="space-y-4">
                    {/* Suggested Skills */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-white">
                          Suggested for {selectedProfession === "student" ? "Students" : selectedProfession === "teacher" ? "Teachers" : "Employees"}
                        </label>
                        <span className="text-xs text-text-muted">Click to add</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {selectedProfession === "student" && [
                          "Research & Analysis", "Academic Writing", "Critical Thinking", "Time Management",
                          "Team Collaboration", "Presentation Skills", "Problem Solving", "Note-Taking",
                          "Laboratory Skills", "Data Analysis", "Microsoft Office", "Google Workspace"
                        ].filter(skill => !skills.includes(skill)).map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-3 py-2 bg-white/5 text-text-muted rounded-lg text-xs hover:bg-blue-500/20 hover:text-blue-300 border border-white/10 hover:border-blue-500/30 transition-all text-left"
                          >
                            <i className="fi fi-br-plus text-[10px] mr-1"></i>
                            {skill}
                          </button>
                        ))}
                        {selectedProfession === "teacher" && [
                          "Curriculum Design", "Classroom Management", "Student Assessment", "Differentiated Instruction",
                          "Educational Technology", "Parent Communication", "Lesson Planning", "Subject Expertise",
                          "Student Engagement", "Special Education", "Online Teaching", "Mentoring"
                        ].filter(skill => !skills.includes(skill)).map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-3 py-2 bg-white/5 text-text-muted rounded-lg text-xs hover:bg-green-500/20 hover:text-green-300 border border-white/10 hover:border-green-500/30 transition-all text-left"
                          >
                            <i className="fi fi-br-plus text-[10px] mr-1"></i>
                            {skill}
                          </button>
                        ))}
                        {selectedProfession === "employee" && [
                          "Project Management", "Communication", "Leadership", "Strategic Planning",
                          "Data Analysis", "Problem Solving", "Team Collaboration", "Time Management",
                          "Business Analysis", "Marketing Strategy", "Financial Analysis", "Technical Skills"
                        ].filter(skill => !skills.includes(skill)).map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-3 py-2 bg-white/5 text-text-muted rounded-lg text-xs hover:bg-primary-teal/20 hover:text-primary-teal border border-white/10 hover:border-primary-teal/30 transition-all text-left"
                          >
                            <i className="fi fi-br-plus text-[10px] mr-1"></i>
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Skills */}
                    {skills.length > 0 && (
                      <div className="p-4 bg-black/30 rounded-lg border border-white/10">
                        <label className="text-sm font-medium text-white mb-3 block">Your Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span 
                              key={skill} 
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border ${
                                selectedProfession === "student" 
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                                  : selectedProfession === "teacher"
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : "bg-primary-teal/20 text-primary-teal border-primary-teal/30"
                              }`}
                            >
                              {skill}
                              <button 
                                onClick={() => removeSkill(skill)}
                                type="button"
                                className="hover:scale-110 transition-transform"
                              >
                                <i className="fi fi-br-cross-small"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Skill Input */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Add Custom Skill</label>
                      <input
                        type="text"
                        placeholder="Type a skill and press Enter..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.target.value.trim();
                            if (value) {
                              addSkill(value);
                              e.target.value = '';
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span 
                            key={skill} 
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              selectedProfession === "student" 
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                : selectedProfession === "teacher"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-primary-teal/20 text-primary-teal border border-primary-teal/30"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fi fi-br-sparkles text-text-muted text-xl"></i>
                        </div>
                        <p className="text-sm text-text-muted">No skills added yet</p>
                        <button 
                          onClick={() => setEditingSection('skills')}
                          type="button"
                          className="mt-3 text-sm text-primary-teal hover:text-primary-teal/80 font-medium"
                        >
                          Add your first skill →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Degrees & Certificates */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-teal/20 rounded-lg flex items-center justify-center">
                    <i className="fi fi-br-diploma text-primary-teal text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Degrees & Certificates</h2>
                    {certificates.length > 0 && (
                      <p className="text-sm text-text-muted">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
                {editingSection === 'certificates' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCancelEdit('certificates')}
                      type="button"
                      className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSaveSection('Certificates')}
                      disabled={loading}
                      type="button"
                      className="px-5 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fi fi-br-check"></i>
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setEditingSection('certificates')}
                    type="button"
                    className="px-4 py-2 text-primary-teal hover:bg-primary-teal/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <i className="fi fi-br-pencil"></i>
                    Edit
                  </button>
                )}
              </div>

              {editingSection === 'certificates' ? (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-5 bg-black/50 border border-white/10 rounded-lg">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'name', e.target.value)}
                          placeholder="Certificate/Degree Name"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                        />
                        <input
                          type="text"
                          value={cert.organization}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'organization', e.target.value)}
                          placeholder="Issuing Organization"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => handleUpdateCertificate(cert.id, 'issueDate', e.target.value)}
                            placeholder="Issue Date"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                          />
                          <input
                            type="text"
                            value={cert.certificateId}
                            onChange={(e) => handleUpdateCertificate(cert.id, 'certificateId', e.target.value)}
                            placeholder="Certificate ID"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-all"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveCertificate(cert.id)}
                          type="button"
                          className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <i className="fi fi-br-trash text-sm"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={handleAddCertificate}
                    type="button"
                    className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-text-muted hover:text-white hover:border-primary-teal/50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <i className="fi fi-br-plus"></i>
                    Add Certificate
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.length > 0 ? certificates.map((cert) => (
                    <div key={cert.id} className="p-4 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex gap-3">
                        <div className="h-11 w-11 bg-primary-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fi fi-br-diploma text-primary-teal"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 truncate">{cert.name || 'Untitled Certificate'}</h3>
                          <p className="text-sm text-text-muted mb-1 truncate">{cert.organization || 'Organization'}</p>
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span>{cert.issueDate || 'Date not specified'}</span>
                            {cert.certificateId && (
                              <>
                                <span>•</span>
                                <span>ID: {cert.certificateId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fi fi-br-diploma text-text-muted text-2xl"></i>
                      </div>
                      <p className="text-text-muted text-sm">No certificates added yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="bg-white/[0.04] rounded-xl p-6">
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white/[0.04] rounded-xl p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateAccount}
                type="button"
                className="w-full bg-gradient-to-r from-primary-teal to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Update Account
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-teal to-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fi fi-br-lock text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
                  <p className="text-sm text-text-muted">Manage your privacy preferences</p>
                </div>
              </div>
            </div>

            {/* Privacy Options */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fi fi-br-eye text-primary-teal"></i>
                Visibility Settings
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    label: "Make my profile public", 
                    desc: "Anyone can view your profile",
                    icon: "fi-br-globe",
                    key: "publicProfile"
                  },
                  { 
                    label: "Show my email to others", 
                    desc: "Your email will be visible on your profile",
                    icon: "fi-br-envelope",
                    key: "showEmail"
                  },
                  { 
                    label: "Allow messages from anyone", 
                    desc: "Receive messages from all users",
                    icon: "fi-br-comment",
                    key: "allowMessages"
                  },
                  { 
                    label: "Show online status", 
                    desc: "Let others see when you're active",
                    icon: "fi-br-signal-alt",
                    key: "showOnlineStatus"
                  },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group p-4 bg-black/40 border border-white/10 rounded-lg hover:border-primary-teal/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-teal/20 transition-colors">
                          <i className={`fi ${item.icon} text-primary-teal text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white mb-1">{item.label}</p>
                          <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Switcher8
                          isChecked={privacyToggles[item.key]}
                          onChange={() => setPrivacyToggles(prev => ({
                            ...prev,
                            [item.key]: !prev[item.key]
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white/[0.04] rounded-xl p-6 border border-rose-500/20">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <i className="fi fi-br-exclamation text-rose-400"></i>
                Danger Zone
              </h3>
              <p className="text-sm text-text-muted mb-4">Irreversible actions that affect your account</p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                type="button"
                className="px-6 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg hover:bg-rose-500/20 hover:border-rose-500/50 transition-all font-semibold flex items-center gap-2"
              >
                <i className="fi fi-br-trash"></i>
                Delete Account Permanently
              </button>
            </div>
            {/* Simple Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                type="button"
                className="px-8 py-3 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fi fi-rr-spinner animate-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fi fi-br-disk"></i>
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Success/Error Toast */}
      {(success || error) && (
        <div className={`fixed top-20 right-8 z-50 animate-slide-down ${
          success ? 'bg-green-500' : 'bg-rose-500'
        } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
          <i className={`fi ${success ? 'fi-br-check-circle' : 'fi-br-cross-circle'} text-2xl`}></i>
          <span className="font-semibold">{success || error}</span>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-rose-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-rose-500/20 rounded-full flex items-center justify-center border-2 border-rose-500/50">
                <i className="fi fi-br-exclamation text-rose-400 text-4xl"></i>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Delete Account Permanently?
            </h2>
            <p className="text-text-muted text-center mb-6">
              This action cannot be undone. All your data, including profile information, posts, and connections will be permanently deleted.
            </p>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Confirm with your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 transition-all"
                autoFocus
              />
            </div>

            {/* Warning List */}
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-rose-400 mb-2">You will lose:</p>
              <ul className="space-y-1 text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <i className="fi fi-br-cross-small text-rose-400"></i>
                  All profile information and settings
                </li>
                <li className="flex items-center gap-2">
                  <i className="fi fi-br-cross-small text-rose-400"></i>
                  All posts and content
                </li>
                <li className="flex items-center gap-2">
                  <i className="fi fi-br-cross-small text-rose-400"></i>
                  All connections and messages
                </li>
                <li className="flex items-center gap-2">
                  <i className="fi fi-br-cross-small text-rose-400"></i>
                  Access to this account forever
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                type="button"
                className="flex-1 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || loading}
                type="button"
                className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fi fi-br-trash"></i>
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
