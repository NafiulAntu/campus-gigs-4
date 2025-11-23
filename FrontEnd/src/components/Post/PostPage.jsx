import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import PostComposer from "./PostComposer";
import Profile from "./side bar/profile";
import Messages from "./side bar/messages";
import Notifications from "./side bar/notifications";
import Communities from "./side bar/communities";
import Premium from "./side bar/premium";
import Payments from "./side bar/payments";
import { getAllPosts, createPost, updatePost, deletePost as deletePostAPI, toggleLike as toggleLikeAPI, toggleShare as toggleShareAPI } from "../../services/api";

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

const initialPosts = [
  {
    id: 1,
    text: "We completed the initial prototype. Files uploaded in attachments.",
    files: [],
    author: { name: "Project Bot", avatar: null, verified: true },
    replies: 3,
    reposts: 1,
    likes: 9,
    views: 980,
    liked: false,
    reposted: false,
    accepted: false,
    rejected: false,
    reacted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    text: "Uploaded dataset for analysis. Check the team folder.",
    files: [],
    author: { name: "Researcher", avatar: null, verified: false },
    replies: 12,
    reposts: 7,
    likes: 54,
    views: 2100,
    liked: false,
    reposted: false,
    accepted: false,
    rejected: false,
    reacted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

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
  const menuRef = useRef(null);

  // Load current user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getAllPosts();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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
  const followingPeople = [
    { name: "Ayesha", handle: "@ayesha" },
    { name: "Imran", handle: "@imran" },
    { name: "Neha", handle: "@neha" },
  ];
  const followerPeople = [
    { name: "Rahul", handle: "@rahul" },
    { name: "Saba", handle: "@saba" },
    { name: "Tanvir", handle: "@tanvir" },
  ];

  // No external navbar toggle; search can still be opened via Explore or local top button

  async function handleNewPost(postData) {
    try {
      console.log('📤 Creating post with data:', postData);
      const response = await createPost({
        content: postData.text || '',
        media_urls: postData.media_urls || []
      });
      
      console.log('✅ Post created:', response.data);
      
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

  function handleNewPostOld(post) {
    const p = {
      id: post.id || Date.now(),
      text: post.text || "",
      files: post.files || [],
      author: post.author || { name: "You", avatar: null, verified: false },
      replies: 0,
      reposts: 0,
      likes: 0,
      views: 0,
      liked: false,
      reposted: false,
      accepted: false,
      rejected: false,
      createdAt: post.createdAt || new Date().toISOString(),
    };
    setPosts((prev) => [p, ...prev]);
  }

  function handleEditPost(updatedPost) {
    if (updatedPost) {
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
      );
    }
    setEditingPost(null);
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

  async function toggleRepost(id) {
    try {
      const response = await toggleShareAPI(id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            user_shared: response.data.shared,
            shares_count: response.data.sharesCount,
          };
        })
      );
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  }

  function toggleAccept(id) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextAccepted = !p.accepted;
        return {
          ...p,
          accepted: nextAccepted,
          rejected: nextAccepted ? false : p.rejected,
        };
      })
    );
  }

  function toggleReject(id) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextRejected = !p.rejected;
        return {
          ...p,
          rejected: nextRejected,
          accepted: nextRejected ? false : p.accepted,
        };
      })
    );
  }

  function toggleReactPost(id) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reacted: !p.reacted } : p))
    );
  }

  async function deletePost(id) {
    const confirmed = window.confirm('🗑️ Delete this post?\n\nThis action cannot be undone.');
    
    if (confirmed) {
      try {
        await deletePostAPI(id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setOpenMenuId(null);
        
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
    <div className="w-full min-h-screen">
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
          brightOn ? 'bg-[#0F172A]' : 'bg-black'
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
          <Messages onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "notifications" && (
          <Notifications onBack={() => setCurrentView("home")} />
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
                brightOn ? 'border-white bg-[#0F172A]' : 'border-[#045F5F] bg-black'
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
                  brightOn ? 'text-black placeholder:text-[#008B8B]/60' : 'text-blue-300 placeholder:text-blue-400/60'
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
          {!isSearching && <PostComposer onPost={handleNewPost} onEdit={handleUpdatePost} editingPost={editingPost} brightOn={brightOn} />}

          {/* Divider after composer or under sticky search */}
          <div className={`transition-colors duration-300 ${
            brightOn ? 'border-b-2 border-gray-200' : 'border-b border-white/10'
          }`}></div>

          {/* Explore mode: show recommendations when searching */}
          {isSearching && !showResults && (
            <div className="mt-0">
              <div className="pl-6 pr-4 py-4">
                <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                  brightOn ? 'text-white' : 'text-white'
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
                        brightOn ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        brightOn ? 'text-white/70' : 'text-text-muted'
                      }`}>
                        Trending in {t.area}
                      </div>
                      <div className={`font-bold text-base transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-white' : 'text-white'
                      }`}>{t.title}</div>
                      <div className={`text-xs font-medium transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-white/70' : 'text-text-muted'
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
                  brightOn ? 'text-white' : 'text-white'
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
                <div className="text-primary-teal text-lg">Loading posts...</div>
              </div>
            ) : filteredPosts.map((p, index) => {
              const avatarLetter = p.full_name ? p.full_name[0].toUpperCase() : "U";
              const isCurrentUserPost = currentUser && p.posted_by === currentUser.id;
              
              // Debug logging (only for first post to avoid spam)
              if (index === 0) {
                console.log('🔍 Post debug:', {
                  postId: p.id,
                  posted_by: p.posted_by,
                  currentUserId: currentUser?.id,
                  isCurrentUserPost,
                  hasMedia: p.media_urls?.length > 0,
                  mediaUrls: p.media_urls
                });
              }
              
              return (
                <div
                  key={p.id}
                  className={`mb-2 transition-colors duration-300 border overflow-hidden ${
                    brightOn ? 'border-white' : 'border-[#045F5F]'
                  }`}
                >
                  <article className={`px-6 sm:px-8 py-5 sm:py-6 transition-colors duration-150 ${
                    brightOn ? 'bg-[#0F172A] hover:bg-[#1E293B]' : 'bg-gray-900/30 hover:bg-gray-900/40'
                  }`}>
                    <div className="flex items-start gap-3 sm:gap-4">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 leading-tight flex-wrap">
                              <span className={`font-bold text-[15px] sm:text-[17px] transition-colors duration-300 ${
                                brightOn ? 'text-white' : 'text-blue-400'
                              }`}>
                                {p.full_name || "Unknown"}
                              </span>
                              <span className={`text-xs sm:text-sm truncate transition-colors duration-300 ${
                                brightOn ? 'text-[#008B8B]' : 'text-text-muted'
                              }`}>
                                @{p.username || "unknown"}
                              </span>
                              <span className={`hidden sm:inline transition-colors duration-300 ${
                                brightOn ? 'text-[#008B8B]' : 'text-text-muted'
                              }`}>•</span>
                              <a
                                href="#"
                                className={`text-xs sm:text-sm hover:underline hidden sm:inline transition-colors duration-300 ${
                                  brightOn ? 'text-[#008B8B] hover:text-[#00CED1]' : 'text-text-muted hover:text-white'
                                }`}
                              >
                                {formatRelativeTime(p.createdAt)}
                              </a>
                            </div>
                          </div>
                          <div className="relative" ref={openMenuId === p.id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                              className={`shrink-0 rounded-full p-2 transition-all duration-300 ${
                                openMenuId === p.id 
                                  ? 'bg-primary-teal/20 text-primary-teal' 
                                  : brightOn ? 'text-[#008B8B] hover:text-[#00CED1] hover:bg-[#1E293B]' : 'text-text-muted hover:text-white hover:bg-white/5'
                              }`}
                              aria-label="More options"
                            >
                              <i className="fa-solid fa-ellipsis" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openMenuId === p.id && (
                              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-50 border transition-colors duration-300 ${
                                brightOn ? 'bg-[#1E293B] border-white/20' : 'bg-gray-900 border-white/10'
                              }`}>
                                {isCurrentUserPost && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingPost(p);
                                        setOpenMenuId(null);
                                      }}
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 ${
                                        brightOn ? 'text-white hover:bg-[#2D3B4E]' : 'text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-edit text-lg"></i>
                                      <span className="font-semibold">Edit Post</span>
                                    </button>
                                    <button
                                      onClick={() => deletePost(p.id)}
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 border-t ${
                                        brightOn 
                                          ? 'text-rose-400 hover:bg-rose-500/10 border-white/10' 
                                          : 'text-rose-400 hover:bg-rose-500/10 border-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-trash text-lg"></i>
                                      <span className="font-semibold">Delete Post</span>
                                    </button>
                                  </>
                                )}
                                {!isCurrentUserPost && (
                                  <>
                                    <button
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 ${
                                        brightOn ? 'text-white hover:bg-[#2D3B4E]' : 'text-white hover:bg-white/10'
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
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`mt-2 leading-[1.6] whitespace-pre-wrap font-medium text-[15px] sm:text-[17px] break-words transition-colors duration-300 ${
                          brightOn ? 'text-white' : 'text-white'
                        }`}>
                          {p.content}
                        </div>

                        {p.media_urls && p.media_urls.length > 0 && (
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
                                    className={`rounded-xl overflow-hidden border relative group ${
                                      brightOn ? 'border-white/20 bg-[#1E293B]' : 'border-primary-teal/20 bg-gray-800/30'
                                    } ${itemClass}`}
                                  >
                                    <img
                                      src={url}
                                      alt={`Media ${i + 1}`}
                                      className={`object-cover w-full ${imgHeight} hover:scale-105 transition-transform duration-300`}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                                      }}
                                    />
                                    {/* Hover overlay with download button */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                      <a
                                        href={url}
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110`}
                                        title="Download image"
                                      >
                                        <i className="fas fa-download text-white text-lg" />
                                      </a>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110`}
                                        title="Open in new tab"
                                      >
                                        <i className="fas fa-expand text-white text-lg" />
                                      </a>
                                    </div>
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
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-2.5 rounded-lg transition-all hover:scale-110 ${
                                          brightOn 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal'
                                        }`}
                                        title="Download"
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
                              onClick={() => toggleRepost(p.id)}
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
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all transition-colors duration-300 ${
                                brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                              } hover:bg-[#89CFF0]/10`}
                              title="Send"
                            >
                              <i className="fi fi-br-paper-plane text-[18px]" />
                              <span className="text-sm font-semibold">Send</span>
                            </button>

                            {/* Edit button - only for user's own posts */}
                            {isCurrentUserPost && (
                              <button
                                onClick={() => setEditingPost(p)}
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

                          {/* Accept/Reject buttons on the right */}
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
                  <i className={`fa-regular fa-sun text-2xl transition-all duration-300 ${brightOn ? 'text-white scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-500 scale-100 group-hover:text-gray-400'}`} />
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
                {(peopleTab === "active"
                  ? [...followingPeople, ...followerPeople]
                  : peopleTab === "following"
                  ? followingPeople
                  : followerPeople
                ).map((p) => (
                  <div
                    key={p.handle}
                    className={`flex items-center gap-2 px-2 py-1 transition-colors ${
                      brightOn ? 'hover:bg-[#94a3b8]/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative h-8 w-8 rounded-full bg-primary/20 text-white flex items-center justify-center text-xs font-semibold">
                      {p.name[0]}
                      {peopleTab === "active" && <span className="pulse-dot" />}
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-sm text-white flex items-center gap-2 font-bold">
                        {p.name}
                        {peopleTab === "active" && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            • Active
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        brightOn ? 'text-gray-400' : 'text-text-muted'
                      }`}>{p.handle}</div>
                    </div>
                    {peopleTab === "followers" ? (
                      <button className="text-xs rounded-full px-2 py-1 btn-accent">
                        Follow
                      </button>
                    ) : (
                      <button className="text-xs rounded-full px-2 py-1 bg-white/10 hover:bg-white/20 text-white">
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsor section removed per request */}
          </div>
        </div>
      </aside>
      )}
      </div>
    </div>
  );
}
