import React, { useState, useRef, useEffect } from "react";
import { uploadFiles } from '../../services/api';

export default function PostComposer({ onPost, onEdit, editingPost, brightOn = false }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const mediaInputRef = useRef(null);
  const attachInputRef = useRef(null);
  const MAX_CHARS = 280; // Free user limit

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    const mapped = list.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview:
        f.type && (f.type.startsWith("image/") || f.type.startsWith("video/"))
          ? URL.createObjectURL(f)
          : null,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }

  function removeFile(index) {
    setFiles((prev) => {
      const item = prev[index];
      if (item && item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  useEffect(() => {
    return () => {
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingPost) {
      setText(editingPost.text || "");
      setFiles(editingPost.files || []);
    } else {
      setText("");
      setFiles([]);
    }
  }, [editingPost]);

  function cancelEdit() {
    setText("");
    setFiles([]);
    if (mediaInputRef.current) mediaInputRef.current.value = null;
    if (attachInputRef.current) attachInputRef.current.value = null;
    if (onEdit) onEdit(null); // This will set editingPost to null
  }

  async function submit() {
    try {
      let mediaUrls = [];
      
      // Upload files if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(f => {
          if (f.file) {
            formData.append('files', f.file);
          }
        });
        
        const uploadResponse = await uploadFiles(formData);
        mediaUrls = uploadResponse.data.files || [];
      }

      if (editingPost) {
        // Edit mode
        const updatedPost = {
          ...editingPost,
          text,
          media_urls: mediaUrls,
        };
        if (onEdit) onEdit(updatedPost);
      } else {
        // Create mode
        const newPost = {
          text,
          media_urls: mediaUrls,
        };
        if (onPost) onPost(newPost);
      }
      
      // Cleanup
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setText("");
      setFiles([]);
      if (mediaInputRef.current) mediaInputRef.current.value = null;
      if (attachInputRef.current) attachInputRef.current.value = null;
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to upload files. Please try again.');
    }
  }

  return (
    <div id="post-composer" className={`composer-card px-6 sm:px-8 py-3 sm:py-4 scroll-mt-4 transition-colors duration-300 border mb-6 ${
      brightOn ? 'bg-[#0F172A] border-white' : 'bg-gray-900/40 border-[#045F5F]'
    }`}>
      <div className="flex flex-col gap-2 md:gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          {user?.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt="Profile" 
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-primary-teal/20 shadow-md"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md ring-2 ring-primary-teal/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => {
              const newText = e.target.value;
              if (newText.length <= MAX_CHARS) {
                setText(newText);
              }
            }}
            placeholder={editingPost ? "Edit your post..." : "What's on your mind?"}
            className={`w-full min-h-[120px] sm:min-h-[160px] p-3 sm:p-4 composer-input resize-none text-[16px] sm:text-[18px] leading-relaxed focus:outline-none focus:ring-2 transition-all border-2 ${
              brightOn ? 'text-white placeholder:text-[#008B8B]/60 bg-[#1E293B] border-white focus:ring-white/50 focus:border-white' : 'text-blue-300 placeholder:text-blue-400/60 bg-gray-900/30 border-[#045F5F] focus:ring-[#045F5F]/50 focus:border-[#045F5F]'
            }`}
          />
        </div>
        {/* Character counter */}
        <div className={`text-xs sm:text-sm text-right transition-colors duration-300 ${
          text.length > MAX_CHARS * 0.9 ? 'text-red-400' : brightOn ? 'text-gray-500' : 'text-blue-400/60'
        }`}>
          {text.length}/{MAX_CHARS}
        </div>
      </div>

      <div className="mt-3 md:mt-4 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Media: images and videos */}
          <label className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full cursor-pointer chip-action hover:bg-primary-teal/10 transition-all">
            <input
              ref={mediaInputRef}
              type="file"
              onChange={handleFiles}
              className="hidden"
              accept="image/*,video/*"
              multiple
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 5a3 3 0 013-3h10a3 3 0 013 3v14a3 3 0 01-3 3H7a3 3 0 01-3-3V5zm3 0a1 1 0 00-1 1v6.586l2.293-2.293a1 1 0 011.414 0L12 15l2.293-2.293a1 1 0 011.414 0L18 15.586V6a1 1 0 00-1-1H7zm7.5 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
            <span className="hidden sm:inline font-medium">Media</span>
          </label>

          {/* Attach: documents and other files */}
          <label className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full cursor-pointer chip-action hover:bg-primary-teal/10 transition-all">
            <input
              ref={attachInputRef}
              type="file"
              onChange={handleFiles}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,text/*,application/*"
              multiple
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 2a2 2 0 00-2 2v10a4 4 0 108 0V6a4 4 0 10-8 0v8a2 2 0 104 0V6a2 2 0 10-4 0v8" />
            </svg>
            <span className="hidden sm:inline font-medium">Attach</span>
          </label>

          <button className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full cursor-pointer chip-action hover:bg-primary-teal/10 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline font-medium">GIF</span>
          </button>

          {/* <div className="text-[12px] sm:text-[14px] text-gray-400 font-semibold px-2">{files.length} file(s)</div> */}
        </div>

        <div className="flex items-center gap-8">
          {editingPost && (
            <button
              onClick={cancelEdit}
              className="px-5 sm:px-6 md:px-7 py-2 sm:py-2 bg-gray-700/50 hover:bg-red-600/50 text-red rounded-full font-bold text-[14px] sm:text-[16px] shadow-md transition-all"
            >
              Nix
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text && files.length === 0}
            className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-2 btn-baby-blue rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed text-[14px] sm:text-[16px] shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {editingPost ? "Update" : "Post"}
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-1.5 md:mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="relative bg-input p-1.5 rounded-xl overflow-hidden"
            >
              {f.preview ? (
                f.type?.startsWith("image/") ? (
                  <img
                    src={f.preview}
                    alt={f.name}
                    className="object-cover w-full h-24 rounded"
                  />
                ) : f.type?.startsWith("video/") ? (
                  <video
                    src={f.preview}
                    className="object-cover w-full h-24 rounded"
                    controls
                    muted
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-sm">
                      📄
                    </div>
                    <div className="truncate text-sm">{f.name}</div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-sm">
                    📄
                  </div>
                  <div className="truncate text-sm">{f.name}</div>
                </div>
              )}
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label={`Remove ${f.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
