import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  getUserById, 
  getTeacherProfile, 
  getStudentProfile, 
  getEmployeeProfile 
} from "../../services/api";
import { getOrCreateConversation, testFirestoreConnection } from "../../utils/messagingUtils";
import { diagnoseMessagingIssue } from "../../utils/accountLinking";
import { auth } from "../../config/firebase";

export default function UserProfile({ userId, onBack, onMessageClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const handleSendMessage = async () => {
    try {
      setStartingChat(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        alert('Please login to send messages');
        return;
      }

      // Diagnose messaging capability
      const diagnosis = await diagnoseMessagingIssue(user);
      
      if (!diagnosis.canSendMessages) {
        console.error('Cannot send message. Issues:', diagnosis.issues);
        const issueMsg = diagnosis.issues.join('\n');
        const solutionMsg = diagnosis.solutions.join('\n');
        alert(`Cannot send message:\n\n${issueMsg}\n\nSolution:\n${solutionMsg}`);
        return;
      }

      const otherUserFirebaseUid = user.firebase_uid;
      console.log('Creating conversation between:', {
        currentUser: currentUser.uid,
        otherUser: otherUserFirebaseUid
      });

      // Create or get existing conversation
      const conversationId = await getOrCreateConversation(
        currentUser.uid,
        otherUserFirebaseUid,
        user.full_name || user.username,
        profileData?.profilePicUrl || user.profile_picture
      );

      console.log('✅ Conversation ready:', conversationId);

      // Navigate to messages with conversation selected
      if (onMessageClick) {
        onMessageClick(conversationId);
      } else {
        // Fallback: navigate to messages page
        navigate('/messages', { 
          state: { 
            conversationId,
            userId: otherUserFirebaseUid,
            userName: user.full_name || user.username,
            userPhoto: profileData?.profilePicUrl || user.profile_picture
          }
        });
      }

    } catch (error) {
      console.error('Error starting conversation:', error);
      console.error('Error details:', error.message, error.stack);
      
      // More specific error messages with solutions
      if (error.code === 'permission-denied') {
        alert('⛔ Firestore Permission Denied\n\nThis means Firestore security rules are blocking the operation.\n\nTo fix:\n1. Go to Firebase Console\n2. Navigate to Firestore Database\n3. Go to Rules tab\n4. Update rules to allow authenticated users to create conversations\n\nSee MESSAGING_DEBUG.md for the correct security rules.');
      } else if (error.code === 'unavailable') {
        alert('🔴 Firestore Database Unavailable\n\nPossible causes:\n1. Firestore is not enabled in Firebase Console\n2. Internet connection issue\n3. Firebase quota exceeded\n\nTo fix:\n1. Go to Firebase Console\n2. Navigate to Firestore Database\n3. Click "Create database" if not already created\n4. Choose production mode and select a location\n\nCheck browser console for more details.');
      } else {
        alert(`❌ Failed to start conversation\n\n${error.message}\n\nCheck browser console (F12) for more details.`);
      }
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        console.log('User profile response:', response);
        // Handle both response.data and response.data.data structures
        const userData = response.data?.data || response.data;
        setUser(userData);
        
        // Check if viewing own profile
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setIsOwnProfile(currentUser.id === parseInt(userId));
        
        // Fetch profession-specific profile data
        if (userData.username && userData.profession) {
          try {
            let profileResponse;
            const profession = userData.profession.toLowerCase();
            
            if (profession === 'teacher') {
              profileResponse = await getTeacherProfile(userData.username);
            } else if (profession === 'student') {
              profileResponse = await getStudentProfile(userData.username);
            } else if (profession === 'employee') {
              profileResponse = await getEmployeeProfile(userData.username);
            }
            
            if (profileResponse?.data) {
              const profData = profileResponse.data?.data || profileResponse.data;
              console.log('Profile data:', profData);
              setProfileData(profData);
            }
          } catch (profErr) {
            console.log('No profession profile found:', profErr);
            // Not an error - user might not have completed their profile
          }
        }
        
        setError("");
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto mb-4"></div>
          <p className="text-blue-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
          <p className="text-red-400 mb-4">{error || "User not found"}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary-teal hover:bg-primary-blue text-white rounded-full font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const avatarLetter = user.full_name ? user.full_name[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-[#045F5F]">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="text-primary-teal hover:text-white transition-colors"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{user.full_name || "User Profile"}</h1>
            <p className="text-sm text-blue-400">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto">
        {/* Cover Image */}
        <div className="w-full h-48 bg-gradient-to-r from-primary-teal to-blue-500 relative overflow-hidden">
          {profileData?.coverPicUrl ? (
            <img
              src={profileData.coverPicUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 mb-4">
            {(profileData?.profilePicUrl || user.profile_picture) ? (
              <img
                src={profileData?.profilePicUrl || user.profile_picture}
                alt={profileData?.fullName || user.full_name}
                className="w-32 h-32 rounded-full border-4 border-black object-cover shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-black bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profileData?.fullName || user.full_name || "Unknown User"}
                </h2>
                <p className="text-blue-400 mb-3">@{profileData?.username || user.username}</p>
              </div>
              
              {/* Message Button - Only show if not own profile */}
              {!isOwnProfile && (
                <button
                  onClick={handleSendMessage}
                  disabled={startingChat}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-teal to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startingChat ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>Message</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {(profileData?.user?.email || user.email) && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <i className="fas fa-envelope text-blue-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-white font-medium break-all">{profileData?.user?.email || user.email}</p>
                </div>
              </div>
            )}
            
            {profileData?.phone && profileData.phone !== 'null' && profileData.phone !== '' && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-teal/10 flex items-center justify-center">
                  <i className="fas fa-phone text-primary-teal"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-white font-medium">{profileData.phone}</p>
                </div>
              </div>
            )}

            {profileData?.gender && profileData.gender !== 'null' && profileData.gender !== '' && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <i className="fas fa-venus-mars text-purple-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                  <p className="text-white font-medium">{profileData.gender}</p>
                </div>
              </div>
            )}

            {user.profession && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <i className="fas fa-briefcase text-orange-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Profession</p>
                  <p className="text-white font-medium capitalize">{user.profession}</p>
                </div>
              </div>
            )}

            {profileData?.location && profileData.location !== 'null' && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <i className="fas fa-map-marker-alt text-green-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-white font-medium">{profileData.location}</p>
                </div>
              </div>
            )}

            {profileData?.websiteUrl && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <i className="fas fa-globe text-cyan-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                  <a 
                    href={profileData.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-teal hover:text-blue-400 font-medium transition-colors break-all"
                  >
                    {profileData.websiteUrl}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6 pb-6 border-b border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
          </div>


          {/* Bio/Description */}
          {(profileData?.bio || user.bio) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">About</h3>
              <p className="text-gray-300 leading-relaxed">{profileData?.bio || user.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profileData?.interests && profileData.interests.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-heart text-primary-teal"></i>
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-primary-teal/10 text-primary-teal rounded-lg text-sm border border-primary-teal/30 hover:bg-primary-teal/20 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profileData?.professionalSkills && profileData.professionalSkills.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-code text-blue-400"></i>
                Professional Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.professionalSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profileData?.education && profileData.education.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-green-400"></i>
                Education
              </h3>
              <div className="space-y-3">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-school text-green-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{edu.degree || edu.institution}</div>
                      {edu.institution && edu.degree && (
                        <div className="text-gray-400 text-xs mt-0.5">{edu.institution}</div>
                      )}
                      {edu.year && (
                        <div className="text-gray-500 text-xs mt-0.5">{edu.year}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {profileData?.certificates && profileData.certificates.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-certificate text-yellow-400"></i>
                Certificates
              </h3>
              <div className="space-y-3">
                {profileData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-award text-yellow-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{cert.title || cert.name}</div>
                      {cert.issuer && (
                        <div className="text-gray-400 text-xs mt-0.5">{cert.issuer}</div>
                      )}
                      {cert.date && (
                        <div className="text-gray-500 text-xs mt-0.5">{cert.date}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={onBack}
                  className="flex-1 px-6 py-3 bg-primary-teal hover:bg-primary-blue text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
                <button 
                  className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-full font-semibold transition-all transform hover:scale-110 shadow-lg hover:shadow-red-500/50 overflow-hidden"
                  title="Delete Account"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  <i className="fas fa-trash relative z-10 transition-transform group-hover:rotate-12"></i>
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 px-6 py-3 bg-primary-teal hover:bg-primary-blue text-white rounded-full font-semibold transition-all transform hover:scale-105">
                  <i className="fas fa-user-plus mr-2"></i>
                  Follow
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-all transform hover:scale-105">
                  <i className="fas fa-envelope mr-2"></i>
                  Message
                </button>
              </>
            )}
          </div>

          {/* Recent Posts Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Recent Posts</h3>
            <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-[#045F5F]">
              <i className="fas fa-sticky-note text-4xl text-gray-600 mb-3"></i>
              <p className="text-gray-400">No posts yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
