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
  toggleLike as toggleLikeAPI,
  toggleShare as toggleShareAPI
} from "../../../services/api";
import { getOrCreateConversation } from "../../../utils/messagingUtils";
import { auth } from "../../../config/firebase";

// Repost Composer Component
function RepostComposer({ originalPost, onSubmit, onCancel }) {
  const [repostText, setRepostText] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = () => {
    onSubmit(repostText);
  };

  return (
    <div className="space-y-4">
      {/* Current User */}
      <div className="flex items-start gap-3">
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={user.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={repostText}
            onChange={(e) => setRepostText(e.target.value)}
            placeholder="Add your thoughts..."
            className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#045F5F] min-h-[100px]"
            autoFocus
          />
        </div>
      </div>

      {/* Original Post Preview */}
      <div className="ml-14 border-l-2 border-gray-700 pl-4">
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            {originalPost.profile_picture ? (
              <img
                src={originalPost.profile_picture}
                alt={originalPost.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold text-xs">
                {originalPost.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{originalPost.full_name}</p>
              <p className="text-xs text-gray-400">@{originalPost.username}</p>
            </div>
          </div>

          <p className="text-gray-200 mb-3">{originalPost.content}</p>

          {/* Original Post Media Preview */}
          {originalPost.media_urls && originalPost.media_urls.length > 0 && (
            <div className="flex gap-2">
              {originalPost.media_urls.slice(0, 2).map((url, index) => {
                if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                  return (
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  );
                }
                return null;
              })}
              {originalPost.media_urls.length > 2 && (
                <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  +{originalPost.media_urls.length - 2}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#045F5F] to-[#89CFF0] hover:opacity-90 text-white font-bold transition-opacity flex items-center gap-2"
        >
          <i className="fas fa-retweet"></i>
          Repost
        </button>
      </div>
    </div>
  );
}

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
  const [showImageControls, setShowImageControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostingPost, setRepostingPost] = useState(null);

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

  const toggleRepost = async (post) => {
    // Open modal with post data
    setRepostingPost(post);
    setRepostModalOpen(true);
  };

  const handleRepostSubmit = async (content) => {
    if (!repostingPost) return;
    
    try {
      const response = await toggleShareAPI(repostingPost.id);
      
      setUserPosts(prev =>
        prev.map(p => {
          if (p.id !== repostingPost.id) return p;
          return {
            ...p,
            user_shared: response.data.shared,
            shares_count: response.data.sharesCount
          };
        })
      );
      
      // Close modal
      setRepostModalOpen(false);
      setRepostingPost(null);
    } catch (error) {
      console.error('Error creating repost:', error);
    }
  };

  const openImageViewer = (images, startIndex) => {
    const imageUrls = images.filter(url => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    
    if (imageUrls.length === 0) {
      return;
    }
    
    // Find the correct index in the filtered image array
    const clickedImage = images[startIndex];
    const actualIndex = imageUrls.findIndex(url => url === clickedImage);
    
    setCurrentImages(imageUrls);
    setCurrentImageIndex(actualIndex >= 0 ? actualIndex : 0);
    setImageViewerOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
    setShowImageControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
    // Force restore scrolling
    requestAnimationFrame(() => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
    });
  };

  const handleImageMouseMove = () => {
    setShowImageControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      setShowImageControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const downloadCurrentImage = () => {
    const url = currentImages[currentImageIndex];
    const fileName = url.split('/').pop();
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(err => {
        console.error('Download error:', err);
        window.open(url, '_blank');
      });
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

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!imageViewerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto-hide controls after 3 seconds
    const timeout = setTimeout(() => {
      setShowImageControls(false);
    }, 3000);
    setControlsTimeout(timeout);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [imageViewerOpen, currentImages.length]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, []);

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
                  <button
                    onClick={() => {
                      navigate(`/send-money?to=${userId}`);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold rounded-full border border-emerald-500/40 hover:shadow-lg hover:scale-105 transition-all"
                    title="Send money"
                  >
                    <i className="fas fa-money-bill-wave"></i>
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
              <div className="space-y-4">
                {userPosts.map((post) => {
                  const avatarLetter = post.full_name ? post.full_name[0].toUpperCase() : "U";
                  const imageCount = post.media_urls?.filter(url => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length || 0;
                  const fileCount = post.media_urls?.filter(url => url && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length || 0;
                  
                  return (
                    <div
                      key={post.id}
                      onClick={() => {
                        // Navigate to post page and scroll to this post
                        onBack(post.id);
                      }}
                      className="bg-gray-900/40 border border-[#045F5F]/30 rounded-xl p-5 hover:border-[#045F5F]/60 hover:bg-gray-900/50 transition-all cursor-pointer"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-3 mb-4">
                        {post.profile_picture ? (
                          <img
                            src={post.profile_picture}
                            alt={post.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold text-sm">
                            {avatarLetter}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base">{post.full_name || "Unknown User"}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>@{post.username || "user"}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.created_at)}</span>
                            {imageCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <i className="far fa-image"></i>
                                  {imageCount}
                                </span>
                              </>
                            )}
                            {fileCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <i className="far fa-file"></i>
                                  {fileCount}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words mb-3">
                          {post.content}
                        </div>
                      )}

                      {/* Post Media */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className={`grid gap-2 ${
                          post.media_urls.length === 1 
                            ? 'grid-cols-1' 
                            : post.media_urls.length === 2 
                            ? 'grid-cols-2' 
                            : post.media_urls.length === 3 
                            ? 'grid-cols-2' 
                            : 'grid-cols-2'
                        }`}>
                          {post.media_urls.map((url, i) => {
                            if (!url) return null;
                            
                            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const count = post.media_urls.length;
                            const isFirstLarge = count === 3 && i === 0;
                            const itemClass = isFirstLarge ? "col-span-2" : "";
                            
                            if (isImage) {
                              const imgHeight = count === 1 ? "h-48" : count === 2 ? "h-40" : isFirstLarge ? "h-48" : "h-32";
                              
                              return (
                                <div
                                  key={i}
                                  className={`rounded-xl overflow-hidden border border-[#045F5F]/20 transition-all relative group ${itemClass}`}
                                >
                                  <img
                                    src={url}
                                    alt=""
                                    className={`object-cover w-full ${imgHeight}`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                                    }}
                                  />
                                </div>
                              );
                            } else {
                              const fileName = url.split('/').pop();
                              const fileExt = fileName.split('.').pop().toLowerCase();
                              
                              // Get appropriate icon and color
                              let fileIcon = '📎';
                              let fileColor = 'bg-[#045F5F]/10 text-[#045F5F]';
                              
                              if (['pdf'].includes(fileExt)) {
                                fileIcon = '📄';
                                fileColor = 'bg-red-500/20 text-red-400';
                              } else if (['doc', 'docx', 'odt', 'rtf'].includes(fileExt)) {
                                fileIcon = '📝';
                                fileColor = 'bg-blue-500/20 text-blue-400';
                              } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
                                fileIcon = '📊';
                                fileColor = 'bg-green-500/20 text-green-400';
                              } else if (['ppt', 'pptx'].includes(fileExt)) {
                                fileIcon = '📽️';
                                fileColor = 'bg-orange-500/20 text-orange-400';
                              } else if (['zip', 'rar', '7z'].includes(fileExt)) {
                                fileIcon = '📦';
                                fileColor = 'bg-yellow-500/20 text-yellow-400';
                              } else if (['txt'].includes(fileExt)) {
                                fileIcon = '📃';
                                fileColor = 'bg-gray-500/20 text-gray-400';
                              }
                              
                              return (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`flex items-center gap-3 p-4 rounded-xl border border-[#045F5F]/20 bg-gray-800/20 hover:bg-gray-800/40 hover:border-[#045F5F]/40 transition-all col-span-2 ${itemClass}`}
                                >
                                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${fileColor}`}>
                                    {fileIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate font-medium">{fileName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 uppercase">{fileExt} file</div>
                                  </div>
                                  <i className="fas fa-external-link-alt text-sm text-gray-400"></i>
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
      {imageViewerOpen && currentImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
          onClick={(e) => {
            e.stopPropagation();
            closeImageViewer();
          }}
          onMouseMove={handleImageMouseMove}
          style={{ touchAction: 'none', pointerEvents: 'auto' }}
        >
          {/* Fixed size image container */}
          <div 
            className="relative rounded-2xl shadow-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center"
            style={{ 
              width: '1200px',
              maxWidth: '90vw',
              height: '800px',
              maxHeight: '85vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image wrapper with padding */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ padding: '60px' }}
            >
              <img
                src={currentImages[currentImageIndex]}
                alt="View"
                className="rounded-lg shadow-2xl"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20">Image not found</text></svg>';
                }}
              />
            </div>
            
            {/* Top control bar */}
            <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-all duration-300 ${showImageControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center justify-between">
                {/* Image counter */}
                {currentImages.length > 1 && (
                  <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white text-sm font-semibold border border-white/20">
                    {currentImageIndex + 1} / {currentImages.length}
                  </div>
                )}
                
                {currentImages.length <= 1 && <div></div>}
                
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeImageViewer();
                  }}
                  className="w-10 h-10 rounded-lg bg-red-500/90 hover:bg-red-600 flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:scale-105"
                  aria-label="Close"
                >
                  <i className="fas fa-times text-lg" />
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 ${showImageControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  aria-label="Previous"
                >
                  <i className="fas fa-chevron-left text-xl" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 ${showImageControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  aria-label="Next"
                >
                  <i className="fas fa-chevron-right text-xl" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {repostModalOpen && repostingPost && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-[#045F5F]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Repost</h3>
              <button
                onClick={() => {
                  setRepostModalOpen(false);
                  setRepostingPost(null);
                }}
                className="w-10 h-10 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Repost Composer */}
              <RepostComposer 
                originalPost={repostingPost}
                onSubmit={handleRepostSubmit}
                onCancel={() => {
                  setRepostModalOpen(false);
                  setRepostingPost(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
