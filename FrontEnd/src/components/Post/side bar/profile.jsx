import React, { useState } from "react";

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
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: false,
    showEmail: false,
    allowMessages: false,
    showOnlineStatus: false,
  });

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
          <div className="relative h-48 bg-gradient-to-r from-primary-teal to-blue-500">
            <button className="absolute top-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              <i className="fi fi-br-camera text-white"></i>
            </button>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-teal to-blue-500 flex items-center justify-center font-bold text-white text-4xl border-4 border-black">
                  Y
                </div>
                <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary-teal rounded-full flex items-center justify-center hover:bg-primary-blue transition-colors border-2 border-black">
                  <i className="fi fi-br-camera text-white"></i>
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">Your Name</h1>
                <p className="text-text-muted mb-2">@your_handle</p>
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
              <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Your Name"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue="your_handle"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
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
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer appearance-none"
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
                  <select className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-black text-text-muted">Select your gender</option>
                    <option value="male" className="bg-black text-white">Male</option>
                    <option value="female" className="bg-black text-white">Female</option>
                    <option value="non-binary" className="bg-black text-white">Non-binary</option>
                    <option value="prefer-not-to-say" className="bg-black text-white">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about yourself, your skills, and what you're looking for..."
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all resize-none"
                  />
                  <p className="text-xs text-text-muted mt-1">0 / 160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
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
                <h2 className="text-xl font-bold text-white">Education</h2>
                <button className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg hover:bg-primary-teal/30 transition-colors text-sm font-semibold">
                  + Add Education
                </button>
              </div>
              <div className="space-y-4">
                {/* Education Entry Example */}
                <div className="p-4 bg-black border border-white/20 rounded-lg hover:border-primary-teal/50 transition-all">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Institution Type
                      </label>
                      <select className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all cursor-pointer appearance-none"
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
                        placeholder="e.g., Stanford University"
                        className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
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
                        placeholder="e.g., Bachelor of Science"
                        className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Year Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 2020 - 2024"
                        className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                      />
                    </div>
                  </div>
                  <button className="text-rose-400 hover:text-rose-300 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                    <i className="fi fi-br-trash"></i>
                    Remove
                  </button>
                </div>
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
                    <h2 className="text-xl font-bold text-white">Professional Skills</h2>
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
                      {["Research", "Data Analysis", "Writing", "Critical Thinking", "Time Management", "Presentation"].map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                          {skill}
                          <button className="hover:text-white hover:scale-110 transition-transform">
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add student skill and press Enter"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Academic writing, Laboratory work, Collaborative projects, Note-taking</p>
                  </div>
                )}

                {/* Teacher Skills */}
                {selectedProfession === "teacher" && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Curriculum Design", "Mentoring", "Public Speaking", "Lesson Planning", "Student Assessment", "Educational Technology"].map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold flex items-center gap-2 border border-green-500/30 hover:bg-green-500/30 transition-all">
                          {skill}
                          <button className="hover:text-white hover:scale-110 transition-transform">
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add teaching skill and press Enter"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Classroom management, Differentiated instruction, Subject expertise, Student engagement</p>
                  </div>
                )}

                {/* Employee Skills */}
                {selectedProfession === "employee" && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["React", "Node.js", "Project Management", "Team Leadership", "Problem Solving", "Communication"].map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg text-sm font-semibold flex items-center gap-2 border border-primary-teal/30 hover:bg-primary-teal/30 transition-all">
                          {skill}
                          <button className="hover:text-white hover:scale-110 transition-transform">
                            <i className="fi fi-br-cross-small"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add professional skill and press Enter"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                    />
                    <p className="text-xs text-text-muted mt-2">💡 Example skills: Programming languages, Design tools, Business analysis, Marketing strategy</p>
                  </div>
                )}
              </div>
            )}

            {/* Degrees & Certificates */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Degrees & Certificates</h2>
                <button className="px-4 py-2 bg-primary-teal/20 text-primary-teal rounded-lg hover:bg-primary-teal/30 transition-colors text-sm font-semibold">
                  + Add Certificate
                </button>
              </div>
              <div className="space-y-4">
                {/* Certificate Entry Example */}
                <div className="p-4 bg-black border border-white/20 rounded-lg hover:border-primary-teal/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary-teal/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary-teal/30">
                      <i className="fi fi-br-diploma text-primary-teal text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Certificate/Degree Name"
                        className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all mb-3"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all mb-3"
                      />
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Issue Date"
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Certificate ID (optional)"
                          className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                        />
                      </div>
                      <button className="text-rose-400 hover:text-rose-300 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                        <i className="fi fi-br-trash"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <button className="w-full bg-gradient-to-r from-primary-teal to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity">
                Save All Changes
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white/[0.04] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="you@example.com"
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
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

              <button className="w-full bg-gradient-to-r from-primary-teal to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity">
                Update Account
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="bg-white/[0.04] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Privacy Settings</h2>
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
                <button className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
