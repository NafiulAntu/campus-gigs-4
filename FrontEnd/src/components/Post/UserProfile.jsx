import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  getUserById, 
  getTeacherProfile, 
  getStudentProfile, 
  getEmployeeProfile,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowCounts,
  getUserPosts,
  toggleLike as toggleLikeAPI
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers_count: 0, following_count: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  const handleSendMessage = async () => {
    try {
      setStartingChat(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        alert('Please login to send messages');
        return;
      }

      // Get current user's profile data from localStorage
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = currentUserData.full_name || currentUserData.username || currentUser.displayName || 'User';
      const currentUserPhoto = currentUserData.profile_picture || currentUser.photoURL || null;

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

      // Create or get existing conversation with both users' information
      const conversationId = await getOrCreateConversation(
        currentUser.uid,
        otherUserFirebaseUid,
        user.full_name || user.username,
        profileData?.profilePicUrl || user.profile_picture,
        currentUserName,
        currentUserPhoto
      );

      // Navigate to messages with conversation selected
      const receiverInfo = {
        conversationId,
        userId: otherUserFirebaseUid,
        userName: user.full_name || user.username,
        userPhoto: profileData?.profilePicUrl || user.profile_picture
      };
      
      if (onMessageClick) {
        onMessageClick(conversationId, receiverInfo);
      } else {
        // Fallback: navigate to messages page
        navigate('/messages', { 
          state: receiverInfo
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

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setFollowCounts(prev => ({
          ...prev,
          followers_count: Math.max(0, prev.followers_count - 1)
        }));
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setFollowCounts(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1
        }));
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      alert(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await getUserPosts(userId);
      // Backend returns { posts: [...] } directly
      const posts = response.data.posts || response.data || [];
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await toggleLikeAPI(postId);
      setUserPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p;
          return {
            ...p,
            user_liked: response.data.liked,
            likes_count: response.data.likesCount
          };
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const openImageViewer = (images, startIndex) => {
    setCurrentImages(images);
    setCurrentImageIndex(startIndex);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        // Handle both response.data and response.data.data structures
        const userData = response.data?.data || response.data;
        setUser(userData);
        
        // Check if viewing own profile
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const ownProfile = currentUser.id === parseInt(userId);
        setIsOwnProfile(ownProfile);
        
        // Fetch follow status and counts if not own profile
        if (!ownProfile) {
          try {
            const [statusResponse, countsResponse] = await Promise.all([
              checkFollowStatus(userId),
              getFollowCounts(userId)
            ]);
            setIsFollowing(statusResponse.data.isFollowing);
            setFollowCounts(countsResponse.data.data);
          } catch (err) {
            console.error('Error fetching follow data:', err);
          }
        } else {
          // For own profile, just fetch counts
          try {
            const countsResponse = await getFollowCounts(userId);
            setFollowCounts(countsResponse.data.data);
          } catch (err) {
            console.error('Error fetching follow counts:', err);
          }
        }
        
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
      fetchUserPosts();
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
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profileData?.fullName || user.full_name || "Unknown User"}
                </h2>
                <p className="text-blue-400 mb-3">@{profileData?.username || user.username}</p>
              </div>
              
              {/* Quick Action Buttons - Only show if not own profile */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isFollowing 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-gradient-to-r from-primary-teal to-blue-500 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isFollowing ? (
                      <i className="fas fa-user-check"></i>
                    ) : (
                      <i className="fas fa-user-plus"></i>
                    )}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={startingChat}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {startingChat ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
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
          <div className="flex gap-8 mb-6 pb-6 border-b border-white/10">
            <div className="text-center cursor-pointer hover:scale-105 transition-transform group">
              <div className="text-2xl font-bold text-white group-hover:text-primary-teal transition-colors">
                {userPosts.length}
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">Posts</div>
            </div>
            <div className="text-center cursor-pointer hover:scale-105 transition-transform group">
              <div className="text-2xl font-bold text-white group-hover:text-primary-teal transition-colors">
                {followCounts.followers_count || 0}
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">Followers</div>
            </div>
            <div className="text-center cursor-pointer hover:scale-105 transition-transform group">
              <div className="text-2xl font-bold text-white group-hover:text-primary-teal transition-colors">
                {followCounts.following_count || 0}
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">Following</div>
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
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-teal to-blue-500 hover:from-primary-teal/90 hover:to-blue-500/90 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-primary-teal/30"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
                <button 
                  className="group relative px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50 overflow-hidden"
                  title="Delete Account"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  <i className="fas fa-trash relative z-10 transition-transform group-hover:rotate-12"></i>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex-1 px-6 py-3.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFollowing 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white hover:shadow-gray-700/30' 
                      : 'bg-gradient-to-r from-primary-teal to-blue-500 hover:from-primary-teal/90 hover:to-blue-500/90 text-white hover:shadow-primary-teal/30'
                  }`}
                >
                  {followLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                      <span>Loading...</span>
                    </>
                  ) : isFollowing ? (
                    <>
                      <i className="fas fa-user-check mr-2"></i>
                      Following
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      Follow
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={startingChat}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500/90 hover:to-cyan-500/90 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startingChat ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Message
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Recent Posts Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center">
                  <i className="fas fa-newspaper text-white text-lg"></i>
                </div>
                Recent Posts
              </h3>
              {userPosts.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#045F5F]/20 to-[#89CFF0]/20 border border-[#045F5F]/30 text-sm text-gray-300">
                  {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                </span>
              )}
            </div>
            
            {postsLoading ? (
              <div className="text-center py-16">
                <div className="relative inline-block">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#045F5F] absolute inset-0"></div>
                </div>
                <p className="text-gray-400 mt-4 font-medium">Loading posts...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-gray-900/40 rounded-2xl border border-[#045F5F]/30 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#045F5F]/20 to-[#89CFF0]/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-4xl text-gray-500"></i>
                </div>
                <p className="text-gray-400 text-lg font-medium">No posts yet</p>
                <p className="text-gray-500 text-sm mt-2">Posts will appear here once shared</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => {
                  const avatarLetter = post.full_name ? post.full_name[0].toUpperCase() : "U";
                  
                  return (
                    <div
                      key={post.id}
                      className="group relative bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-900/60 border border-[#045F5F]/40 rounded-2xl p-6 hover:border-[#89CFF0]/60 hover:shadow-xl hover:shadow-[#045F5F]/10 transition-all duration-300 backdrop-blur-sm"
                    >
                      {/* Decorative gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#045F5F]/5 via-transparent to-[#89CFF0]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      
                      {/* Post Header */}
                      <div className="relative flex items-start gap-4 mb-5">
                        {post.profile_picture ? (
                          <img
                            src={post.profile_picture}
                            alt={post.full_name}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#045F5F]/30 group-hover:ring-[#89CFF0]/50 transition-all duration-300 shadow-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold text-xl ring-2 ring-[#045F5F]/30 group-hover:ring-[#89CFF0]/50 transition-all duration-300 shadow-lg">
                            {avatarLetter}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-lg mb-0.5 group-hover:text-[#89CFF0] transition-colors duration-200">{post.full_name || "Unknown User"}</h4>
                          <p className="text-gray-400 text-sm font-medium">@{post.username || "user"}</p>
                          <div className="flex items-center flex-wrap gap-3 mt-2.5">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <i className="far fa-clock"></i>
                              <span>{formatTimeAgo(post.created_at)}</span>
                            </div>
                            {post.media_urls && post.media_urls.length > 0 && (
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <i className="far fa-image"></i>
                                <span>{post.media_urls.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length} {post.media_urls.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length === 1 ? 'photo' : 'photos'}</span>
                              </div>
                            )}
                            {post.media_urls && post.media_urls.some(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <i className="far fa-file"></i>
                                <span>{post.media_urls.filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length} {post.media_urls.filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length === 1 ? 'file' : 'files'}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <i className="far fa-comment-dots"></i>
                              <span>{post.content ? post.content.length : 0} characters</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="relative text-gray-100 text-[15.5px] leading-relaxed whitespace-pre-wrap break-words mb-4">
                        {post.content}
                      </div>

                      {/* Post Media */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div
                          className={`relative grid ${
                            post.media_urls.length === 1
                              ? "grid-cols-1"
                              : post.media_urls.length === 2
                              ? "grid-cols-2"
                              : post.media_urls.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2"
                          } gap-3`}
                        >
                          {post.media_urls.slice(0, 4).map((url, i) => {
                            if (!url) return null;
                            
                            const count = post.media_urls.length;
                            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            
                            if (isImage) {
                              const imgHeight = count === 1 ? "h-72" : "h-48";
                              
                              return (
                                <div
                                  key={i}
                                  className={`group/img rounded-xl overflow-hidden border-2 border-[#045F5F]/20 relative hover:border-[#89CFF0]/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                                    count > 4 && i === 3 ? 'relative' : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openImageViewer(post.media_urls.filter(u => u.match(/\.(jpg|jpeg|png|gif|webp)$/i)), i);
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt=""
                                    className={`object-cover w-full ${imgHeight} transition-all duration-300 ${
                                      count > 4 && i === 3 ? 'brightness-50' : 'group-hover/img:brightness-110 group-hover/img:scale-105'
                                    }`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image</text></svg>';
                                    }}
                                  />
                                  {/* Overlay on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                                  
                                  {count > 4 && i === 3 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                                      <span className="text-white text-4xl font-bold">+{count - 4}</span>
                                    </div>
                                  )}
                                  
                                  {/* Zoom icon on hover */}
                                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 transform scale-75 group-hover/img:scale-100">
                                    <i className="fas fa-search-plus text-white text-sm"></i>
                                  </div>
                                </div>
                              );
                            } else {
                              // File attachment
                              const fileName = url.split('/').pop();
                              const fileExt = fileName.split('.').pop().toLowerCase();
                              let fileIcon = '📎';
                              let fileColor = 'bg-gray-700/50 text-gray-300';
                              let borderColor = 'border-gray-600/30';
                              
                              if (['pdf'].includes(fileExt)) {
                                fileIcon = '📄';
                                fileColor = 'bg-red-500/20 text-red-400';
                                borderColor = 'border-red-500/30';
                              } else if (['doc', 'docx'].includes(fileExt)) {
                                fileIcon = '📝';
                                fileColor = 'bg-blue-500/20 text-blue-400';
                                borderColor = 'border-blue-500/30';
                              } else if (['xls', 'xlsx'].includes(fileExt)) {
                                fileIcon = '📊';
                                fileColor = 'bg-green-500/20 text-green-400';
                                borderColor = 'border-green-500/30';
                              } else if (['zip', 'rar'].includes(fileExt)) {
                                fileIcon = '📦';
                                fileColor = 'bg-yellow-500/20 text-yellow-400';
                                borderColor = 'border-yellow-500/30';
                              }
                              
                              return (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`group/file flex items-center gap-3 p-4 rounded-xl border-2 ${borderColor} bg-gray-800/30 hover:bg-gray-800/50 hover:border-[#89CFF0]/50 transition-all duration-300 col-span-full hover:scale-[1.01]`}
                                >
                                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${fileColor} transition-transform duration-300 group-hover/file:scale-110`}>
                                    {fileIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate group-hover/file:text-[#89CFF0] transition-colors">{fileName}</div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-gray-700/50 rounded">{fileExt.toUpperCase()}</span>
                                      <span>Click to open</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#045F5F]/20 group-hover/file:bg-[#89CFF0]/30 flex items-center justify-center transition-all duration-300">
                                    <i className="fas fa-external-link-alt text-sm text-gray-400 group-hover/file:text-[#89CFF0] transition-colors" />
                                  </div>
                                </a>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeImageViewer}
        >
          <button
            onClick={closeImageViewer}
            className="absolute top-6 right-6 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <i className="fas fa-times text-xl"></i>
          </button>

          {currentImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
                }}
                className="absolute left-6 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <i className="fas fa-chevron-left text-xl"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
                }}
                className="absolute right-6 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <i className="fas fa-chevron-right text-xl"></i>
              </button>
            </>
          )}

          {currentImages.length > 1 && (
            <div className="absolute top-6 left-6 z-20 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-semibold">
              {currentImageIndex + 1} / {currentImages.length}
            </div>
          )}

          <div className="relative w-full h-full flex items-center justify-center px-4 py-20" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '85vh' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
