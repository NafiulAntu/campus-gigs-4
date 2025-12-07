import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../sidebar/Sidebar";
import PostComposer from "../components/PostComposer";
import Profile from "../sidebar/profile";
import Messages from "../sidebar/messages";
import Notifications from "../sidebar/notifications";
import Communities from "../sidebar/communities";
import Premium from "../components/Premium";
import Payments from "../sidebar/payments";
import UserProfile from "./UserProfile";
import api, { getAllPosts, createPost, updatePost, deletePost as deletePostAPI, toggleLike as toggleLikeAPI, toggleShare as toggleShareAPI, acceptPost as acceptPostAPI, rejectPost as rejectPostAPI } from "../../../services/api";

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
          className={`box h-6 w-14 rounded-full shadow-inner transition-all duration-300 ${
            isChecked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        ></div>
        <div 
          className={`dot shadow-lg absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
            isChecked ? 'left-[34px] bg-white' : 'left-1 bg-white'
          }`}
        >
          <span
            className={`active h-3 w-3 rounded-full transition-all duration-300 ${
              isChecked ? 'bg-blue-600' : 'bg-gray-400'
            }`}
          ></span>
        </div>
      </div>
    </label>
  );
};

export default function PostPage({ onNavigate = () => {} }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [peopleTab, setPeopleTab] = useState("active");
  const [brightOn, setBrightOn] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1536);
  const [editingPost, setEditingPost] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [repostingPost, setRepostingPost] = useState(null);
  const [postIdToScroll, setPostIdToScroll] = useState(null);
  const menuRef = useRef(null);

  // Load current user and refresh premium status from backend
  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        
        // Refresh user data from backend to get latest premium status
        try {
          const response = await api.get('/users/me');
          if (response.data) {
            const updatedUser = {
              ...parsedUser,
              ...response.data,
              is_premium: response.data.is_premium
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            console.log('✅ User premium status refreshed:', updatedUser.is_premium);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };
    
    loadUserData();
  }, []);

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching posts...');
      const response = await getAllPosts();
      console.log('✅ Posts fetched:', response.data.posts);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    } finally {
      setLoading(false);
      console.log('✓ Loading complete');
    }
  };

  // Initialize CSS vars on mount (light teal accent, default text colors) and set dim mode
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-main", "#70B2B2");
    document.documentElement.style.setProperty("--text-base-color", "#ffffff");
    document.documentElement.style.setProperty("--text-muted-color", "#94a3b8");
    
    // Set initial dim mode
    document.documentElement.style.setProperty("--ui-brightness", "0.85");
    document.documentElement.classList.remove("theme-light");
    document.documentElement.classList.add("force-black");

    // Handle window resize for sidebar width
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1536);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to specific post when postIdToScroll is set
  useEffect(() => {
    if (postIdToScroll && posts.length > 0) {
      // Wait a bit longer for view to fully render
      const timer = setTimeout(() => {
        const postElement = document.getElementById(`post-${postIdToScroll}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the post briefly
          postElement.style.backgroundColor = 'rgba(4, 95, 95, 0.2)';
          postElement.style.transition = 'background-color 0.3s ease';
          setTimeout(() => {
            postElement.style.backgroundColor = '';
          }, 2000);
        } else {
          console.log('Post element not found:', `post-${postIdToScroll}`);
        }
        setPostIdToScroll(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [postIdToScroll, posts]);

  async function handleNewPost(postData) {
    try {
      const response = await createPost({
        content: postData.text || '',
        media_urls: postData.media_urls || []
      });
      
      // Add new post to the top of the list
      if (response.data && response.data.post) {
        setPosts(prev => [response.data.post, ...prev]);
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to create post. ${error.response?.data?.error || error.message || 'Please try again.'}`);
    }
  }

  async function handleUpdatePost(updatedPost) {
    try {
      const response = await updatePost(updatedPost.id, {
        content: updatedPost.text || '',
        media_urls: updatedPost.media_urls || []
      });
      
      // Update the post in the list
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? response.data.post : p));
      }
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  }

  // Explore-like search behavior
  const normalizedQuery = (typeof query === "string" ? query : "")
    .trim()
    .toLowerCase();
  const showResults = isSearching && normalizedQuery.length > 0;
  const filteredPosts = showResults
    ? posts.filter((p) => {
        const txt = (p.text || "").toLowerCase();
        const author = (p.author?.name || "").toLowerCase();
        const q = normalizedQuery.startsWith("#")
          ? normalizedQuery.slice(1)
          : normalizedQuery;
        return (
          txt.includes(normalizedQuery) ||
          txt.includes(`#${q}`) ||
          author.includes(normalizedQuery)
        );
      })
    : posts;

  // Relative time like X.com (e.g., 5s, 2m, 1h, 3d)
  function formatRelativeTime(iso) {
    const now = Date.now();
    const t = new Date(iso).getTime();
    const diff = Math.max(0, now - t);
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }

  function formatCount(n = 0) {
    if (n < 1000) return `${n}`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
    return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
  }

  async function toggleLike(id) {
    try {
      const response = await toggleLikeAPI(id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            user_liked: response.data.liked,
            likes_count: response.data.likesCount,
          };
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async function toggleRepost(post) {
    setRepostingPost(post);
    setEditingPost(null);
    // Scroll to post composer
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  const handleRepost = (postId, responseData) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          user_shared: responseData.shared,
          shares_count: responseData.sharesCount,
        };
      })
    );
  };

  const scrollToPost = (postId) => {
    // Find the post element and scroll to it
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the post briefly
      postElement.classList.add('ring-2', 'ring-[#045F5F]', 'ring-opacity-50');
      setTimeout(() => {
        postElement.classList.remove('ring-2', 'ring-[#045F5F]', 'ring-opacity-50');
      }, 2000);
    }
  };

  async function toggleAccept(id) {
    try {
      console.log('🔄 Attempting to accept post:', id);
      const response = await acceptPostAPI(id);
      
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            accepted: true,
            rejected: false,
          };
        })
      );
      
      console.log('✅ Post accepted successfully:', response.data);
    } catch (error) {
      console.error('❌ Error accepting post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Show more detailed error
      const errorMsg = error.response?.data?.error || error.message || 'Failed to accept post. Please try again.';
      alert(errorMsg);
    }
  }

  async function toggleReject(id) {
    try {
      console.log('🔄 Attempting to reject post:', id);
      const response = await rejectPostAPI(id);
      
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            rejected: true,
            accepted: false,
          };
        })
      );
      
      console.log('✅ Post rejected successfully:', response.data);
    } catch (error) {
      console.error('❌ Error rejecting post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Show more detailed error
      const errorMsg = error.response?.data?.error || error.message || 'Failed to reject post. Please try again.';
      alert(errorMsg);
    }
  }

  function toggleReactPost(id) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reacted: !p.reacted } : p))
    );
  }

  function openDeleteModal(id) {
    setPostToDelete(id);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  }

  async function confirmDelete() {
    if (!postToDelete) return;
    
    try {
      await deletePostAPI(postToDelete);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setDeleteModalOpen(false);
      setPostToDelete(null);
      
      // Show success feedback
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      message.innerHTML = '✓ Post deleted successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Show error feedback
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      message.innerHTML = '✗ Failed to delete post. Please try again.';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  }

  function openImageViewer(images, startIndex) {
    const imageUrls = images.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    if (imageUrls.length === 0) return;
    
    // Find the correct index in the filtered image array
    const clickedImage = images[startIndex];
    const actualIndex = imageUrls.findIndex(url => url === clickedImage);
    
    setCurrentImages(imageUrls);
    setCurrentImageIndex(actualIndex >= 0 ? actualIndex : 0);
    setImageViewerOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeImageViewer() {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset'; // Restore scrolling
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  }

  function previousImage() {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  }

  function downloadCurrentImage() {
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
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!imageViewerOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setImageViewerOpen(false);
        setCurrentImages([]);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'unset';
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageViewerOpen, currentImages.length]);

  function handleNav(key) {
    if (key === "jobs") {
      setIsSearching(true);
      setCurrentView("home");
      return;
    }
    // Update current view based on sidebar navigation
    setCurrentView(key);
  }

  return (
    <div className={`w-full min-h-screen ${brightOn ? 'bg-gray-50' : 'bg-black'}`}>
      <div className="max-w-[1400px] mx-auto flex relative">
        {/* Fixed Left Sidebar - hidden on mobile, compact on xl-2xl, full on 2xl+ */}
        <aside className="hidden xl:block xl:w-[88px] 2xl:w-[275px] fixed left-[max(0px,calc((100vw-1400px)/2))] top-0 h-screen z-30 transition-all duration-300 xl:ml-[-10px] 2xl:ml-[-17px]">
          <div className="h-full flex justify-end xl:pr-2 2xl:pr-3">
            <div className="w-full xl:max-w-[70px] 2xl:max-w-[255px]">
              <Sidebar
                onNavigate={(k) => {
                  handleNav(k);
                  onNavigate(k);
                }}
              />
            </div>
          </div>
        </aside>

        {/* Main content area - Full width when not on home, normal width on home */}
        <div className={`w-full mx-auto px-0 min-h-screen transition-all duration-300 ${
          brightOn ? 'bg-white' : 'bg-black'
        } ${
          currentView === "home" 
            ? "xl:w-[750px] xl:ml-[108px] 2xl:ml-[295px]" 
            : "xl:w-[calc(100%-88px)] xl:ml-[88px] 2xl:w-[calc(100%-275px)] 2xl:ml-[275px]"
        }`}>
        
        {/* Conditional rendering based on currentView */}
        {currentView === "profile" && (
          <Profile onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "messages" && (
          <Messages 
            onBack={() => {
              setCurrentView("home");
              setSelectedConversation(null);
            }}
            initialConversation={selectedConversation}
            onViewProfile={(userId) => {
              setViewingUserId(userId);
              setCurrentView("userProfile");
            }}
          />
        )}
        
        {currentView === "notifications" && (
          <Notifications 
            onBack={(postId) => {
              setCurrentView("home");
              if (postId) {
                setPostIdToScroll(postId);
              }
            }} 
            onViewProfile={(userId) => {
              setViewingUserId(userId);
              setCurrentView("userProfile");
            }}
          />
        )}
        
        {currentView === "communities" && (
          <Communities onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "premium" && (
          <Premium onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "payments" && (
          <Payments onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "userProfile" && viewingUserId && (
          <UserProfile 
            userId={viewingUserId} 
            onBack={(postId) => {
              setCurrentView("home");
              setViewingUserId(null);
              if (postId) {
                setPostIdToScroll(postId);
              }
            }}
            onMessageClick={(conversationId, receiverInfo) => {
              console.log('Message clicked, conversation:', conversationId, 'receiver:', receiverInfo);
              setSelectedConversation(receiverInfo);
              setCurrentView("messages");
              setViewingUserId(null);
            }}
          />
        )}
        
        {/* Home view - Default post feed */}
        {currentView === "home" && (
          <>
  <div className="border-b border-white/10"></div>

        <section className="pt-0">
          {/* Sticky search bar with transparent background - Properly aligned */}
          <div className={`sticky top-0 z-20 backdrop-blur-sm transition-all duration-300 ${
            isSearching ? (brightOn ? 'bg-[#033E3E]/95' : 'bg-[#040720]/95') : 'bg-transparent'
          }`}>
            <div 
              className={`flex items-center gap-3 px-3 py-3.5 transition-all duration-300 border-b ${
                brightOn ? 'border-gray-300 bg-white' : 'border-[#045F5F] bg-black'
              }`}
            >
              <i className={`fi fi-br-search text-xl transition-colors duration-300 ${
                brightOn ? 'text-[#008B8B]' : 'text-blue-400'
              }`}></i>
              <input
                value={query}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setQuery(e.target.value)}
                className={`search-input flex-1 bg-transparent outline-none text-lg font-semibold transition-colors duration-300 ${
                  brightOn ? 'text-gray-900 placeholder:text-gray-500' : 'text-white placeholder:text-blue-400/60'
                }`}
                placeholder="Search #Jobs, Communities, People..."
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              {isSearching && (
                <button
                  className="px-4 py-1.5 rounded-full bg-primary-teal hover:bg-primary-blue text-white text-sm font-semibold transition-colors"
                  onClick={() => { setIsSearching(false); setQuery(""); }}
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.currentTarget.style.outline = 'none'}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Status composer is hidden while searching */}
          {!isSearching && <PostComposer onPost={handleNewPost} onEdit={handleUpdatePost} editingPost={editingPost} repostingPost={repostingPost} onCancelRepost={() => setRepostingPost(null)} onRepost={handleRepost} brightOn={brightOn} />}

          {/* Divider after composer or under sticky search */}
          <div className={`transition-colors duration-300 ${
            brightOn ? 'border-b border-gray-200' : 'border-b border-white/10'
          }`}></div>

          {/* Explore mode: show recommendations when searching */}
          {isSearching && !showResults && (
            <div className="mt-0">
              <div className="pl-6 pr-4 py-4">
                <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                  brightOn ? 'text-gray-900' : 'text-white'
                }`}>
                  Recommended Communities
                </h3>
                <div className="rounded-2xl overflow-hidden">
                  {[
                    { area: "Campus", title: "#Jobs", posts: "12.4k" },
                    { area: "Campus", title: "#Internships", posts: "8,103" },
                    { area: "Technology", title: "#React", posts: "28.1k" },
                    { area: "Remote", title: "#Freelance", posts: "6,980" },
                    { area: "Learning", title: "#OpenSource", posts: "14.7k" },
                  ].map((t, i, arr) => (
                    <button
                      key={t.title}
                      onClick={() => { setQuery(t.title); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        brightOn ? 'hover:bg-gray-100 active:bg-gray-200' : 'hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        brightOn ? 'text-gray-600' : 'text-text-muted'
                      }`}>
                        Trending in {t.area}
                      </div>
                      <div className={`font-bold text-base transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-gray-900' : 'text-white'
                      }`}>{t.title}</div>
                      <div className={`text-xs font-medium transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-gray-600' : 'text-text-muted'
                      }`}>
                        {t.posts} posts
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results list when a query is present */}
          <div className="mt-0">
            {showResults && filteredPosts.length === 0 && (
              <div className="p-10 text-center">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed mb-3 transition-colors duration-300 ${
                  brightOn ? 'border-gray-300' : 'border-text-muted'
                }`}>
                  <i className="fa-regular fa-face-frown" />
                </div>
                <div className={`font-semibold transition-colors duration-300 ${
                  brightOn ? 'text-gray-900' : 'text-white'
                }`}>No results</div>
                <div className={`text-sm transition-colors duration-300 ${
                  brightOn ? 'text-gray-400' : 'text-text-muted'
                }`}>
                  Try a different keyword or hashtag.
                </div>
              </div>
            )}
            {loading ? (
              <div className="p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-teal border-t-transparent mb-4"></div>
                <div className="text-white text-lg font-semibold">Loading posts...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-white text-lg">No posts available</div>
                <div className="text-gray-400 text-sm mt-2">Be the first to create a post!</div>
              </div>
            ) : filteredPosts.map((p, index) => {
              const avatarLetter = p.full_name ? p.full_name[0].toUpperCase() : "U";
              const isCurrentUserPost = currentUser && p.posted_by === currentUser.id;
              
              return (
                <div
                  key={p.id}
                  id={`post-${p.id}`}
                  className={`mb-2 transition-colors duration-300 border overflow-hidden rounded-lg ${
                    brightOn ? 'border-gray-200 bg-white shadow-sm' : 'border-[#045F5F] bg-black'
                  }`}
                >
                  <article className={`px-6 sm:px-8 py-5 sm:py-6 transition-colors duration-150 ${
                    brightOn ? 'bg-white hover:bg-gray-50/70' : 'bg-black hover:bg-gray-900/40'
                  }`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <button
                        onClick={() => {
                          // If it's the current user's post, go to profile page
                          if (p.posted_by === currentUser?.id) {
                            setCurrentView("profile");
                          } else {
                            setViewingUserId(p.posted_by);
                            setCurrentView("userProfile");
                          }
                        }}
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {p.profile_picture ? (
                          <img
                            src={p.profile_picture}
                            alt={p.full_name}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-md ring-2 ring-primary-teal/20"
                          />
                        ) : (
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-md ring-2 ring-primary-teal/20">
                            {avatarLetter}
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 leading-tight flex-wrap">
                              <button
                                onClick={() => {
                                  // If it's the current user's post, go to profile page
                                  if (p.posted_by === currentUser?.id) {
                                    setCurrentView("profile");
                                  } else {
                                    setViewingUserId(p.posted_by);
                                    setCurrentView("userProfile");
                                  }
                                }}
                                className={`font-bold text-[15px] sm:text-[17px] transition-colors duration-300 hover:underline cursor-pointer ${
                                  brightOn ? 'text-gray-900 hover:text-primary-teal' : 'text-white hover:text-primary-teal'
                                }`}
                              >
                                {p.full_name || "Unknown"}
                              </button>
                              <span className={`text-xs sm:text-sm truncate transition-colors duration-300 ${
                                brightOn ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                @{p.username || "unknown"}
                              </span>
                              <span className={`hidden sm:inline transition-colors duration-300 ${
                                brightOn ? 'text-gray-400' : 'text-gray-400'
                              }`}>•</span>
                              <a
                                href="#"
                                className={`text-xs sm:text-sm hover:underline hidden sm:inline transition-colors duration-300 ${
                                  brightOn ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {formatRelativeTime(p.createdAt)}
                              </a>
                            </div>
                          </div>
                          <div className="relative" ref={openMenuId === p.id ? menuRef : null}>
                            {/* Delete button for own posts - X.com style */}
                            {isCurrentUserPost ? (
                              <button
                                onClick={() => openDeleteModal(p.id)}
                                className={`group shrink-0 rounded-full p-2 transition-all duration-200 ${
                                  brightOn 
                                    ? 'hover:bg-red-500/10' 
                                    : 'hover:bg-red-500/10'
                                }`}
                                aria-label="Delete post"
                                title="Delete post"
                              >
                                <i className="fa-solid fa-trash text-sm text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
                              </button>
                            ) : (
                              /* Three dot menu for other users' posts */
                              <>
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                  className={`shrink-0 rounded-full p-2 transition-all duration-300 ${
                                    openMenuId === p.id 
                                      ? 'bg-primary-teal/20 text-primary-teal' 
                                      : brightOn ? 'text-gray-500 hover:text-teal-600 hover:bg-gray-100' : 'text-text-muted hover:text-white hover:bg-white/5'
                                  }`}
                                  aria-label="More options"
                                >
                                  <i className="fa-solid fa-ellipsis" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openMenuId === p.id && (
                                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-50 border transition-colors duration-300 ${
                                    brightOn ? 'bg-white border-gray-200' : 'bg-gray-900 border-white/10'
                                  }`}>
                                    <button
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 ${
                                        brightOn ? 'text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-bookmark text-lg"></i>
                                      <span className="font-semibold">Save Post</span>
                                    </button>
                                    <button
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 border-t ${
                                        brightOn 
                                          ? 'text-rose-400 hover:bg-rose-500/10 border-white/10' 
                                          : 'text-rose-400 hover:bg-rose-500/10 border-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-flag text-lg"></i>
                                      <span className="font-semibold">Report Post</span>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Repost indicator */}
                        {p.repost_of && (
                          <div className={`mt-2 flex items-center gap-2 text-sm ${
                            brightOn ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <i className="fi fi-br-refresh"></i>
                            <span>Reposted</span>
                          </div>
                        )}

                        {/* User's repost comment */}
                        {p.repost_of && p.content && (
                          <div className={`mt-2 leading-[1.6] whitespace-pre-wrap font-medium text-[15px] sm:text-[17px] break-words transition-colors duration-300 ${
                            brightOn ? 'text-black' : 'text-white'
                          }`}>
                            {p.content}
                          </div>
                        )}

                        {/* Original post preview for reposts */}
                        {p.original_post && (
                          <div 
                            onClick={() => scrollToPost(p.original_post.id)}
                            className={`mt-3 border-l-2 pl-4 transition-colors duration-300 cursor-pointer hover:border-[#89CFF0] ${
                              brightOn ? 'border-gray-300' : 'border-[#045F5F]'
                            }`}
                          >
                            <div className={`rounded-xl p-4 border transition-all hover:border-[#045F5F] ${
                              brightOn ? 'bg-[#1E293B] border-white/20 hover:bg-[#1E293B]/80' : 'bg-gray-800/30 border-[#045F5F]/30 hover:bg-gray-800/50'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {p.original_post.profile_picture ? (
                                  <img
                                    src={p.original_post.profile_picture}
                                    alt={p.original_post.full_name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#045F5F]/20"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold text-xs">
                                    {p.original_post.full_name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                )}
                                <div>
                                  <p className={`font-semibold text-sm ${brightOn ? 'text-white' : 'text-white'}`}>
                                    {p.original_post.full_name}
                                  </p>
                                  <p className="text-gray-500 text-xs">@{p.original_post.username}</p>
                                </div>
                              </div>
                              {p.original_post.content && (
                                <p className={`text-sm ${brightOn ? 'text-gray-300' : 'text-gray-300'}`}>
                                  {p.original_post.content}
                                </p>
                              )}
                              {p.original_post.media_urls && p.original_post.media_urls.length > 0 && (
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {p.original_post.media_urls.slice(0, 2).map((url, i) => {
                                    const isImage = url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                    if (isImage) {
                                      return (
                                        <img
                                          key={i}
                                          src={url}
                                          alt=""
                                          className="w-20 h-20 object-cover rounded-lg"
                                        />
                                      );
                                    }
                                    return null;
                                  })}
                                  {p.original_post.media_urls.length > 2 && (
                                    <div className="w-20 h-20 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                      +{p.original_post.media_urls.length - 2}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Regular post content (only for non-reposts) */}
                        {!p.repost_of && (
                          <div className={`mt-2 leading-[1.6] whitespace-pre-wrap font-medium text-[15px] sm:text-[17px] break-words transition-colors duration-300 ${
                            brightOn ? 'text-black' : 'text-white'
                          }`}>
                            {p.content}
                          </div>
                        )}

                        {/* Regular post media (only for non-reposts) */}
                        {!p.repost_of && p.media_urls && p.media_urls.length > 0 && (
                          <div
                            className={`mt-3 grid ${
                              p.media_urls.length === 1
                                ? "grid-cols-1"
                                : p.media_urls.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2"
                            } gap-2`}
                          >
                            {p.media_urls.map((url, i) => {
                              if (!url) return null;
                              
                              const count = p.media_urls.length;
                              const isFirstLarge = count === 3 && i === 0;
                              const itemClass = isFirstLarge ? "col-span-2" : "";
                              
                              // Check if it's an image
                              const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                              
                              if (isImage) {
                                const imgHeight =
                                  count === 1 ? "h-96" : count === 2 ? "h-64" : isFirstLarge ? "h-80" : "h-48";
                                
                                return (
                                  <div
                                    key={i}
                                    className={`rounded-xl overflow-hidden border relative group cursor-pointer ${
                                      brightOn ? 'border-white/20 bg-[#1E293B]' : 'border-primary-teal/20 bg-gray-800/30'
                                    } ${itemClass}`}
                                    onClick={() => openImageViewer(p.media_urls, i)}
                                  >
                                    <img
                                      src={url}
                                      alt=""
                                      className={`object-cover w-full ${imgHeight} hover:scale-105 transition-transform duration-300`}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                                      }}
                                    />
                                  </div>
                                );
                              } else {
                                // File attachment
                                const fileName = url.split('/').pop();
                                const fileExt = fileName.split('.').pop().toLowerCase();
                                
                                // Get appropriate icon based on file type
                                let fileIcon = '📎';
                                let fileColor = brightOn ? 'bg-white/10' : 'bg-primary-teal/10';
                                
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
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                      brightOn 
                                        ? 'border-white/20 bg-[#1E293B]' 
                                        : 'border-primary-teal/20 bg-gray-800/30'
                                    } ${itemClass}`}
                                  >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                                      fileColor
                                    }`}>
                                      {fileIcon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-semibold truncate transition-colors duration-300 text-sm ${
                                        brightOn ? 'text-white' : 'text-white'
                                      }`}>
                                        {fileName}
                                      </div>
                                      <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                                        brightOn ? 'text-[#008B8B]' : 'text-primary-teal'
                                      }`}>
                                        {fileExt.toUpperCase()} File
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Download Button */}
                                      <a
                                        href={url}
                                        download={fileName}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Force download for all file types
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
                                              // Fallback to direct download
                                              window.open(url, '_blank');
                                            });
                                        }}
                                        className={`p-2.5 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                                          brightOn 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal'
                                        }`}
                                        title={`Download ${fileName}`}
                                      >
                                        <i className="fas fa-download text-sm" />
                                      </a>
                                      {/* Open in New Tab Button */}
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-2.5 rounded-lg transition-all hover:scale-110 ${
                                          brightOn 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal'
                                        }`}
                                        title="Open in new tab"
                                      >
                                        <i className="fas fa-external-link-alt text-sm" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                        {/* Action buttons row with full-width divider */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                          <div className="flex items-center gap-2">
                            {/* Sup button (hang loose hand) */}
                            <button
                              onClick={() => toggleLike(p.id)}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                                p.user_liked
                                  ? "text-[#89CFF0] bg-[#89CFF0]/10"
                                  : `transition-colors duration-300 ${
                                      brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                                    } hover:bg-[#89CFF0]/10`
                              }`}
                              title="Sup"
                            >
                              <span className="text-[18px]" style={{ filter: p.user_liked ? 'sepia(1) saturate(5) hue-rotate(160deg) brightness(1.1)' : 'grayscale(1)' }}>🤙</span>
                              <span className="text-sm font-semibold">{p.likes_count || 0}</span>
                            </button>

                            {/* Repost button */}
                            <button
                              onClick={() => toggleRepost(p)}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                                p.user_shared
                                  ? "text-[#89CFF0] bg-[#89CFF0]/10"
                                  : `transition-colors duration-300 ${
                                      brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                                    } hover:bg-[#89CFF0]/10`
                              }`}
                              title="Repost"
                            >
                              <i className="fi fi-br-refresh text-[18px]" />
                              <span className="text-sm font-semibold">{p.shares_count || 0}</span>
                            </button>

                            {/* Send button */}
                            <button
                              onClick={() => {
                                setCurrentView('messages');
                                // If not own post, set the conversation with the post author
                                if (!isCurrentUserPost) {
                                  setSelectedConversation({
                                    id: p.posted_by,
                                    firebase_uid: p.firebase_uid,
                                    full_name: p.full_name,
                                    username: p.username,
                                    profile_picture: p.profile_picture
                                  });
                                }
                              }}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all transition-colors duration-300 ${
                                brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                              } hover:bg-[#89CFF0]/10`}
                              title="Send message"
                            >
                              <i className="fi fi-br-paper-plane text-[18px]" />
                              <span className="text-sm font-semibold">Send</span>
                            </button>

                            {/* Edit button - only for user's own posts */}
                            {isCurrentUserPost && (
                              <button
                                onClick={() => {
                                  setEditingPost(p);
                                  // Scroll to post composer
                                  const composer = document.getElementById('post-composer');
                                  if (composer) {
                                    composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Focus on textarea after a short delay
                                    setTimeout(() => {
                                      const textarea = composer.querySelector('textarea');
                                      if (textarea) textarea.focus();
                                    }, 300);
                                  }
                                }}
                                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all transition-colors duration-300 ${
                                  brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                                } hover:bg-[#89CFF0]/10`}
                                title="Edit"
                              >
                                <i className="fa-solid fa-edit text-[18px]" />
                                <span className="text-sm font-semibold">Edit</span>
                              </button>
                            )}
                          </div>

                          {/* Accept/Reject buttons on the right - only for other users' posts */}
                          {!isCurrentUserPost && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleAccept(p.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 transition-all font-semibold text-sm transition-colors duration-300 ${
                                  p.accepted
                                    ? "text-green-400"
                                    : `${
                                        brightOn ? 'text-gray-400 hover:text-green-400' : 'text-text-muted hover:text-green-400'
                                      }`
                                }`}
                                title="Accept"
                              >
                                <i className="fa-solid fa-check text-[14px]" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => toggleReject(p.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 transition-all font-semibold text-sm transition-colors duration-300 ${
                                  p.rejected
                                    ? "text-rose-400"
                                    : `${
                                        brightOn ? 'text-gray-400 hover:text-rose-400' : 'text-text-muted hover:text-rose-400'
                                      }`
                                }`}
                                title="Reject"
                              >
                                <i className="fa-solid fa-xmark text-[14px]" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>
        </>
        )}
      </div>
      {/* Right-side rail (xl+): Active Users - Properly aligned with post section */}
      {currentView === "home" && (
      <aside 
        className="hidden xl:block w-[375px] fixed top-0 h-screen z-30 brightness-root transition-all duration-300" 
        style={{ 
          left: isWideScreen 
            ? 'calc(max(0px, (100vw - 1400px) / 2) + 287.8px + 750px)' 
            : 'calc(max(0px, (100vw - 1400px) / 2) + 100px + 750px)' 
        }}
      >
        <div className="relative h-full pl-12 pr-4">
          <div className="sticky top-0 pt-4 space-y-4 max-w-[320px]">
            {/* Theme Toggle: Bright / Dim controls */}
            <div className="bg-transparent p-3 rounded-2xl">
              <div className="flex items-center justify-center">
                <div className={`flex items-center gap-4 backdrop-blur-sm rounded-full px-4 py-2.5 border-2 border-white transition-all duration-500 cursor-pointer group ${
                  !brightOn 
                    ? 'bg-black/60 hover:shadow-[0_0_30px_rgba(112,178,178,0.3)] hover:scale-105' 
                    : 'bg-[#0f172a]/80 hover:shadow-[0_0_30px_rgba(15,23,42,0.6)] hover:scale-105'
                }`}>
                  <i className={`fa-regular fa-moon text-2xl transition-all duration-300 ${!brightOn ? 'text-primary-teal scale-125 drop-shadow-[0_0_8px_rgba(112,178,178,0.8)]' : 'text-gray-500 scale-100 group-hover:text-gray-400'}`} />
                  <Switcher8
                    isChecked={brightOn}
                    onChange={() => {
                      const newValue = !brightOn;
                      setBrightOn(newValue);
                      if (newValue) {
                        document.documentElement.style.setProperty(
                          "--ui-brightness",
                          "1"
                        );
                        document.documentElement.classList.add("theme-light");
                        document.documentElement.classList.remove("force-black");
                      } else {
                        document.documentElement.style.setProperty(
                          "--ui-brightness",
                          "0.85"
                        );
                        document.documentElement.classList.remove("theme-light");
                        document.documentElement.classList.add("force-black");
                      }
                    }}
                  />
                  <i className={`fa-regular fa-sun text-2xl transition-all duration-300 ${brightOn ? 'text-amber-500 scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-gray-500 scale-100 group-hover:text-gray-400'}`} />
                </div>
              </div>
            </div>
            {/* People: Active / Following / Followers */}
            <div className={`p-3 people-tabs transition-colors duration-300 ${
              brightOn ? 'bg-[#0f172a]/50' : 'bg-white/[0.04]'
            }`}>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-white">
                  <i className="fa-solid fa-users" />
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-full bg-white/5 p-0.5 mb-2 w-full">
                {[
                  { key: "active", label: "Active" },
                  { key: "following", label: "Following" },
                  { key: "followers", label: "Followers" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setPeopleTab(t.key)}
                    className={`text-xs px-2.5 rounded-full transition-colors w-full text-center h-8 font-bold transition-colors duration-300 ${
                      peopleTab === t.key
                        ? "chip-active"
                        : `${
                            brightOn ? 'text-gray-400 hover:text-white' : 'text-text-muted hover:text-white'
                          } hover:bg-white/10`
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${
                  brightOn ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <i className="fa-solid fa-user-group text-3xl mb-2 opacity-50" />
                  <p className="text-sm font-medium">No users yet</p>
                  <p className="text-xs mt-1 opacity-70">Check back later for active users</p>
                </div>
              </div>
            </div>

            {/* Sponsor section removed per request */}
          </div>
        </div>
      </aside>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={cancelDelete}
        >
          <div 
            className={`relative w-[90%] max-w-sm rounded-2xl shadow-2xl transition-all duration-200 ${
              brightOn ? 'bg-slate-800' : 'bg-[#1a1a1a]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-trash text-red-500 text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Delete post?
                  </h3>
                  <p className={`text-sm ${brightOn ? 'text-gray-400' : 'text-gray-500'}`}>
                    This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3 px-4 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className={`w-full py-3 px-4 rounded-full font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  brightOn 
                    ? 'text-white bg-slate-700 hover:bg-slate-600 focus:ring-slate-500 focus:ring-offset-slate-800' 
                    : 'text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] focus:ring-gray-600 focus:ring-offset-[#1a1a1a]'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewerOpen && currentImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          onClick={closeImageViewer}
        >
          {/* Control buttons in top-right corner */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadCurrentImage();
              }}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center group shadow-lg border border-white/10"
              aria-label="Download"
              title="Download image"
            >
              <i className="fas fa-download text-white text-base group-hover:scale-110 transition-transform" />
            </button>

            {/* Close button */}
            <button
              onClick={closeImageViewer}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-red-500/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-lg border border-white/10"
              aria-label="Close"
              title="Close viewer"
            >
              <i className="fas fa-times text-white text-xl group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Image counter */}
          {currentImages.length > 1 && (
            <div className="absolute top-6 left-6 z-20 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-semibold shadow-lg border border-white/10">
              {currentImageIndex + 1} / {currentImages.length}
            </div>
          )}

          {/* Main image container - takes full viewport */}
          <div 
            className="relative w-full h-full flex items-center justify-center px-4 py-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '85vh' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20">Image not found</text></svg>';
              }}
            />

            {/* Previous button - positioned on left side */}
            {currentImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-2xl border border-white/10"
                aria-label="Previous image"
                title="Previous (←)"
              >
                <i className="fas fa-chevron-left text-white text-2xl group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Next button - positioned on right side */}
            {currentImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-2xl border border-white/10"
                aria-label="Next image"
                title="Next (→)"
              >
                <i className="fas fa-chevron-right text-white text-2xl group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {/* Keyboard navigation hint at bottom */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white/70 text-xs font-medium border border-white/10">
              ← → Arrow keys to navigate
            </div>
          )}
        </div>
      )}

    </div>
  );
}
