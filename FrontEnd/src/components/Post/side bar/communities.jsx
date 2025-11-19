import React, { useState } from "react";

export default function Communities({ onBack }) {
  const [activeTab, setActiveTab] = useState("discover");

  const myCommunities = [
    {
      id: 1,
      name: "React Developers",
      members: 12500,
      posts: 234,
      image: "R",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      name: "Freelance Network",
      members: 8900,
      posts: 156,
      image: "F",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      name: "Campus Hiring",
      members: 15200,
      posts: 342,
      image: "C",
      color: "from-green-500 to-teal-500",
    },
  ];

  const discoverCommunities = [
    {
      id: 4,
      name: "Web3 Developers",
      members: 6700,
      description: "Community for blockchain and Web3 enthusiasts",
      image: "W",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      name: "UI/UX Designers",
      members: 9400,
      description: "Share and discuss design principles and trends",
      image: "U",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: 6,
      name: "Data Science Hub",
      members: 11200,
      description: "ML, AI, and data analysis discussions",
      image: "D",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fi fi-br-arrow-left text-white text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-white">Communities</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {[
              { key: "discover", label: "Discover", icon: "fi fi-br-search" },
              { key: "my", label: "My Communities", icon: "fi fi-br-users-alt" },
              { key: "create", label: "Create", icon: "fi fi-br-plus" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "text-primary-teal border-b-2 border-primary-teal"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* My Communities Tab */}
        {activeTab === "my" && (
          <div className="space-y-4">
            {myCommunities.map((community) => (
              <div
                key={community.id}
                className="bg-white/[0.04] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-16 w-16 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center font-bold text-white text-2xl`}
                  >
                    {community.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {community.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-text-muted mb-3">
                      <span>
                        <i className="fi fi-br-users-alt mr-1"></i>
                        {community.members.toLocaleString()} members
                      </span>
                      <span>
                        <i className="fi fi-br-document mr-1"></i>
                        {community.posts} posts
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-primary-teal hover:bg-primary-blue text-white rounded-lg font-semibold transition-colors">
                        View Community
                      </button>
                      <button className="px-4 py-2 bg-white/[0.04] hover:bg-white/10 text-white rounded-lg font-semibold transition-colors">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === "discover" && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-white/[0.04] px-4 py-4 rounded-lg">
                <i className="fi fi-br-search text-text-muted text-lg"></i>
                <input
                  type="text"
                  placeholder="Search communities..."
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-text-muted border-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoverCommunities.map((community) => (
                <div
                  key={community.id}
                  className="bg-white/[0.04] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`h-14 w-14 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center font-bold text-white text-xl`}
                    >
                      {community.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {community.name}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {community.members.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                  <p className="text-text-muted text-sm mb-4">
                    {community.description}
                  </p>
                  <button className="w-full px-4 py-2 bg-primary-teal hover:bg-primary-blue text-white rounded-lg font-semibold transition-colors">
                    Join Community
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Create a New Community
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter community name"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What is your community about?"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category
                  </label>
                  <select className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-teal transition-colors">
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Marketing</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Privacy
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: "public",
                        label: "Public",
                        desc: "Anyone can see and join",
                      },
                      {
                        value: "private",
                        label: "Private",
                        desc: "Members must be invited",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-lg cursor-pointer hover:bg-white/[0.06] transition-colors"
                      >
                        <input
                          type="radio"
                          name="privacy"
                          value={option.value}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {option.label}
                          </p>
                          <p className="text-sm text-text-muted">
                            {option.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Community Icon
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl bg-white/[0.04] border-2 border-dashed border-white/10 flex items-center justify-center text-text-muted">
                      <i className="fi fi-br-picture text-2xl"></i>
                    </div>
                    <button className="px-4 py-2 bg-white/[0.04] hover:bg-white/10 text-white rounded-lg font-semibold transition-colors">
                      Upload Icon
                    </button>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-primary-teal to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  Create Community
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
