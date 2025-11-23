import React, { useState, useEffect } from "react";
import { getUserById } from "../../services/api";

export default function UserProfile({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        setUser(response.data);
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
        {/* Cover Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-r from-primary-teal to-blue-500"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 mb-4">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
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
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.full_name || "Unknown User"}
            </h2>
            <p className="text-blue-400 mb-3">@{user.username}</p>
            
            {user.email && (
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <i className="fas fa-envelope"></i>
                <span>{user.email}</span>
              </div>
            )}
            
            {user.phone && (
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <i className="fas fa-phone"></i>
                <span>{user.phone}</span>
              </div>
            )}

            {user.profession && (
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <i className="fas fa-briefcase"></i>
                <span className="capitalize">{user.profession}</span>
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
          {user.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">About</h3>
              <p className="text-gray-300 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 bg-primary-teal hover:bg-primary-blue text-white rounded-full font-semibold transition-all transform hover:scale-105">
              <i className="fas fa-user-plus mr-2"></i>
              Follow
            </button>
            <button className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-all transform hover:scale-105">
              <i className="fas fa-envelope mr-2"></i>
              Message
            </button>
          </div>

          {/* Recent Posts Section Placeholder */}
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
