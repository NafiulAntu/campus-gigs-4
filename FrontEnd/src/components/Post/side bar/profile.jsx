import React, { useState, useEffect } from "react";
import { 
  createOrUpdateTeacherProfile, 
  createOrUpdateStudentProfile, 
  createOrUpdateEmployeeProfile,
  getMyTeacherProfile,
  getMyStudentProfile,
  getMyEmployeeProfile
} from "../../../services/api";

const Switcher8 = ({ isChecked, onChange }) => {
  return (
    <label className='flex cursor-pointer select-none items-center'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onChange}
          className='sr-only'
        />
        <div
          className={`box h-5 w-14 rounded-full shadow-inner transition ${
            isChecked ? 'bg-[#EAEEFB]' : 'bg-dark'
          }`}
        ></div>
        <div className='dot shadow-switch-1 absolute left-0 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white transition'>
          <span
            className={`active h-4 w-4 rounded-full border ${
              isChecked ? 'bg-primary border-white' : 'bg-white border-dark'
            }`}
          ></span>
        </div>
      </div>
    </label>
  );
};

export default function Profile({ onBack }) {
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

  // Load user data on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData(prev => ({
        ...prev,
        fullName: parsedUser.full_name || "",
        email: parsedUser.email || "",
      }));
    }
    loadProfile();
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
          username: profile.username || "",
          bio: profile.bio || "",
          location: profile.location || "",
          websiteUrl: profile.websiteUrl || "",
          gender: profile.gender || "",
          coverPicUrl: profile.coverPicUrl || "",
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

  // Reload profile when profession changes
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

      const payload = {
        username: profileData.username,
        fullName: profileData.fullName,
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
        // Update localStorage user data for immediate header update
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          full_name: profileData.fullName,
          username: profileData.username
        }));
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
    }
  };

  // Handle skill removal
  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
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
          // Update user profile picture in localStorage
          if (user) {
            const updatedUser = { ...user, profile_picture: event.target.result };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
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
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement delete account logic
      console.log('Delete account');
      setError('Account deletion feature coming soon');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/10">
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
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
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
                <p className="text-text-muted mb-2">@{profileData.username || 'your_handle'}</p>
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
            {/* Saved Profile Banner */}
            {viewMode === 'saved' && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <i className="fi fi-br-check text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">✨ Profile Saved Successfully!</h3>
                      <p className="text-text-muted text-sm">Your profile is now up to date. Click edit to make changes anytime.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEnableEdit}
                    type="button"
                    className="px-8 py-3 bg-gradient-to-r from-primary-teal to-blue-500 text-white rounded-lg hover:opacity-90 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <i className="fi fi-br-pencil"></i>
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
            {/* Basic Information */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                  {editingSection !== 'profile-info' && <i className="fi fi-br-pencil text-primary-teal text-sm"></i>}
                </div>
                {editingSection === 'profile-info' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelEdit('Profile Information')}
                      type="button"
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('Profile Information')}
                      type="button"
                      disabled={loading}
                      className="px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/80 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <i className="fi fi-rr-spinner animate-spin"></i>
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
                    className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg hover:bg-primary-teal/30 transition-colors text-sm font-semibold flex items-center gap-2"
                  >
                    <i className="fi fi-br-edit"></i>
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your Name"
                      readOnly={editingSection !== 'profile-info'}
                      className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:outline-none transition-all ${
                        editingSection === 'profile-info' 
                          ? 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 hover:border-white/40' 
                          : 'border-white/10 cursor-default'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="your_handle"
                      readOnly={editingSection !== 'profile-info' && viewMode === 'saved'}
                      className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:outline-none transition-all ${
                        editingSection !== 'profile-info' && viewMode === 'saved'
                          ? 'border-white/10 cursor-not-allowed opacity-70'
                          : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Profession
                  </label>
                  <select 
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    disabled={editingSection !== 'profile-info' && viewMode === 'saved'}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:outline-none transition-all appearance-none ${
                      editingSection !== 'profile-info' && viewMode === 'saved'
                        ? 'border-white/10 cursor-not-allowed opacity-70'
                        : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 cursor-pointer'
                    }`}
                  >
                    <option value="" className="bg-black text-text-muted">Select your profession</option>
                    <option value="student" className="bg-black text-white">Student</option>
                    <option value="teacher" className="bg-black text-white">Teacher</option>
                    <option value="employee" className="bg-black text-white">Employee</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Gender
                  </label>
                  <select 
                    value={profileData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={editingSection !== 'profile-info' && viewMode === 'saved'}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:outline-none transition-all appearance-none ${
                      editingSection !== 'profile-info' && viewMode === 'saved'
                        ? 'border-white/10 cursor-not-allowed opacity-70'
                        : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 cursor-pointer'
                    }`}
                  >
                    <option value="" className="bg-black text-text-muted">Select your gender</option>
                    <option value="Male" className="bg-black text-white">Male</option>
                    <option value="Female" className="bg-black text-white">Female</option>
                    <option value="Other" className="bg-black text-white">Other</option>
                    <option value="Prefer not to say" className="bg-black text-white">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself, your skills, and what you're looking for..."
                    readOnly={editingSection !== 'profile-info' && viewMode === 'saved'}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder:text-text-muted focus:outline-none transition-all resize-none ${
                      editingSection !== 'profile-info' && viewMode === 'saved'
                        ? 'border-white/10 cursor-not-allowed opacity-70'
                        : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50'
                    }`}
                  />
                  <p className="text-xs text-text-muted mt-1">{profileData.bio.length} / 500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    readOnly={editingSection !== 'profile-info' && viewMode === 'saved'}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder:text-text-muted focus:outline-none transition-all ${
                      editingSection !== 'profile-info' && viewMode === 'saved'
                        ? 'border-white/10 cursor-not-allowed opacity-70'
                        : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    readOnly={editingSection !== 'profile-info' && viewMode === 'saved'}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder:text-text-muted focus:outline-none transition-all ${
                      editingSection !== 'profile-info' && viewMode === 'saved'
                        ? 'border-white/10 cursor-not-allowed opacity-70'
                        : 'border-white/20 focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white/[0.04] rounded-xl p-6 border border-white/10">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Interests</h2>
                <p className="text-sm text-text-muted">What are you looking for on Campus Gigs?</p>
              </div>
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
                  <label key={interest} className="relative flex items-center gap-3 cursor-pointer group p-3 rounded-lg bg-black border border-white/20 hover:border-primary-teal/50 transition-all">
                    <input
                      type="checkbox"
                      checked={interests.includes(interest)}
                      onChange={() => toggleInterest(interest)}
                      className="w-5 h-5 rounded border-white/30 bg-transparent checked:bg-primary-teal checked:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer accent-primary-teal"
                    />
                    <span className="text-sm font-medium text-text-muted group-hover:text-white transition-colors select-none">
                      {interest}
                    </span>
                    <div className="absolute inset-0 rounded-lg bg-primary-teal/0 group-hover:bg-primary-teal/5 transition-all pointer-events-none"></div>
                  </label>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Education</h2>
                  <i className="fi fi-br-graduation-cap text-primary-teal text-sm"></i>
                  {education.length > 0 && (
                    <span className="px-2 py-1 bg-primary-teal/20 text-primary-teal rounded-full text-xs font-bold">
                      {education.length}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleAddEducation}
                  disabled={viewMode === 'saved'}
                  type="button"
                  className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg hover:bg-primary-teal/30 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fi fi-br-plus"></i>
                  Add Education
                </button>
              </div>
              <div className="space-y-4">
                {education.length > 0 ? education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-black border border-white/20 rounded-lg hover:border-primary-teal/50 transition-all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Institution Type
                        </label>
                        <select 
                          value={edu.type}
                          onChange={(e) => handleUpdateEducation(edu.id, 'type', e.target.value)}
                          disabled={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="" className="bg-black text-text-muted">Select type</option>
                          <option value="school" className="bg-black text-white">School</option>
                          <option value="college" className="bg-black text-white">College</option>
                          <option value="university" className="bg-black text-white">University</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="e.g., Stanford University"
                          readOnly={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Degree/Field
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor of Science"
                          readOnly={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Year Range
                        </label>
                        <input
                          type="text"
                          value={edu.yearRange}
                          onChange={(e) => handleUpdateEducation(edu.id, 'yearRange', e.target.value)}
                          placeholder="e.g., 2020 - 2024"
                          readOnly={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveEducation(edu.id)}
                      disabled={viewMode === 'saved'}
                      type="button"
                      className="text-rose-400 hover:text-rose-300 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fi fi-br-trash"></i>
                      Remove
                    </button>
                  </div>
                )) : (
                  <p className="text-center text-text-muted py-8">No education added yet. Click "+ Add Education" to get started.</p>
                )}
              </div>
            </div>

            {/* Skills by Role - Dynamic based on Profession */}
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
              <div className="bg-white/[0.04] rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Professional Skills</h2>
                      <i className="fi fi-br-sparkles text-primary-teal text-sm"></i>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      Skills for {selectedProfession === "student" ? "Students" : selectedProfession === "teacher" ? "Teachers" : "Employees"}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-teal/20 text-primary-teal rounded-full text-xs font-bold uppercase tracking-wide">
                    {selectedProfession}
                  </span>
                </div>
                
                {/* Student Skills */}
                {selectedProfession === "student" && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.length > 0 ? skills.map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            disabled={viewMode === 'saved'}
                            className="hover:text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      )) : (
                        <p className="text-sm text-text-muted">No skills added yet. Start by adding your first skill below.</p>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Add student skill and press Enter"
                      readOnly={viewMode === 'saved'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && viewMode !== 'saved') {
                          e.preventDefault();
                          addSkill(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Academic writing, Laboratory work, Collaborative projects, Note-taking</p>
                  </div>
                )}

                {/* Teacher Skills */}
                {selectedProfession === "teacher" && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.length > 0 ? skills.map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold flex items-center gap-2 border border-green-500/30 hover:bg-green-500/30 transition-all">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            disabled={viewMode === 'saved'}
                            className="hover:text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      )) : (
                        <p className="text-sm text-text-muted">No skills added yet. Start by adding your first skill below.</p>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Add teaching skill and press Enter"
                      readOnly={viewMode === 'saved'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && viewMode !== 'saved') {
                          e.preventDefault();
                          addSkill(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Classroom management, Differentiated instruction, Subject expertise, Student engagement</p>
                  </div>
                )}

                {/* Employee Skills */}
                {selectedProfession === "employee" && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.length > 0 ? skills.map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg text-sm font-semibold flex items-center gap-2 border border-primary-teal/30 hover:bg-primary-teal/30 transition-all">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            disabled={viewMode === 'saved'}
                            className="hover:text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      )) : (
                        <p className="text-sm text-text-muted">No skills added yet. Start by adding your first skill below.</p>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Add professional skill and press Enter"
                      readOnly={viewMode === 'saved'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && viewMode !== 'saved') {
                          e.preventDefault();
                          addSkill(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Programming languages, Design tools, Business analysis, Marketing strategy</p>
                  </div>
                )}
              </div>
            )}

            {/* Degrees & Certificates */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Degrees & Certificates</h2>
                  <i className="fi fi-br-diploma text-primary-teal text-sm"></i>
                  {certificates.length > 0 && (
                    <span className="px-2 py-1 bg-primary-teal/20 text-primary-teal rounded-full text-xs font-bold">
                      {certificates.length}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleAddCertificate}
                  disabled={viewMode === 'saved'}
                  type="button"
                  className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg hover:bg-primary-teal/30 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fi fi-br-plus"></i>
                  Add Certificate
                </button>
              </div>
              <div className="space-y-4">
                {certificates.length > 0 ? certificates.map((cert) => (
                  <div key={cert.id} className="p-4 bg-black border border-white/20 rounded-lg hover:border-primary-teal/50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary-teal/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary-teal/30">
                        <i className="fi fi-br-diploma text-primary-teal text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'name', e.target.value)}
                          placeholder="Certificate/Degree Name"
                          readOnly={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          value={cert.organization}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'organization', e.target.value)}
                          placeholder="Issuing Organization"
                          readOnly={viewMode === 'saved'}
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => handleUpdateCertificate(cert.id, 'issueDate', e.target.value)}
                            placeholder="Issue Date"
                            readOnly={viewMode === 'saved'}
                            className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <input
                            type="text"
                            value={cert.certificateId}
                            onChange={(e) => handleUpdateCertificate(cert.id, 'certificateId', e.target.value)}
                            placeholder="Certificate ID (optional)"
                            readOnly={viewMode === 'saved'}
                            className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveCertificate(cert.id)}
                          disabled={viewMode === 'saved'}
                          type="button"
                          className="text-rose-400 hover:text-rose-300 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="fi fi-br-trash"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-text-muted py-8">No certificates added yet. Click "+ Add Certificate" to get started.</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white/[0.04] rounded-xl p-6">
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white/[0.04] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-white">Account Settings</h2>
              <i className="fi fi-br-settings text-primary-teal text-sm"></i>
            </div>
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
          <div className="bg-white/[0.04] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-white">Privacy Settings</h2>
              <i className="fi fi-br-lock text-primary-teal text-sm"></i>
            </div>
            <div className="space-y-4">
              {[
                { 
                  label: "Make my profile public", 
                  desc: "Anyone can view your profile",
                  key: "publicProfile"
                },
                { 
                  label: "Show my email to others", 
                  desc: "Your email will be visible on your profile",
                  key: "showEmail"
                },
                { 
                  label: "Allow messages from anyone", 
                  desc: "Receive messages from all users",
                  key: "allowMessages"
                },
                { 
                  label: "Show online status", 
                  desc: "Let others see when you're active",
                  key: "showOnlineStatus"
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                  <Switcher8
                    isChecked={privacyToggles[item.key]}
                    onChange={() => setPrivacyToggles(prev => ({
                      ...prev,
                      [item.key]: !prev[item.key]
                    }))}
                  />
                </div>
              ))}

              <div className="pt-4">
                <button 
                  onClick={handleDeleteAccount}
                  type="button"
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                >
                  Delete Account
                </button>
              </div>
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

      {/* Floating Save Button - appears when there are unsaved changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-primary-teal to-blue-500 rounded-xl shadow-2xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loadProfile();
                  setHasUnsavedChanges(false);
                  setEditingSection(null);
                }}
                type="button"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-semibold"
              >
                Discard
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                type="button"
                className="px-6 py-2 bg-white text-primary-teal rounded-lg hover:bg-white/90 transition-colors font-bold flex items-center gap-2"
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
        </div>
      )}

      {/* Success/Error Toast */}
      {(success || error) && (
        <div className={`fixed top-20 right-8 z-50 animate-slide-down ${
          success ? 'bg-green-500' : 'bg-rose-500'
        } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
          <i className={`fi ${success ? 'fi-br-check-circle' : 'fi-br-cross-circle'} text-2xl`}></i>
          <span className="font-semibold">{success || error}</span>
        </div>
      )}
    </div>
  );
}
