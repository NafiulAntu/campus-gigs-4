import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, memo } from "react";
import Footer from "./Footer.jsx";
import { FiArrowRight } from "react-icons/fi";
import {
  FaPaperPlane,
  FaBullhorn,
  FaUpload,
  FaTrophy,
  FaMedal,
  FaClipboardCheck,
} from "react-icons/fa";
import {
  motion,
  useMotionTemplate,
  animate,
  useMotionValue,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

// Cycling accent colors for animated gradients/borders
// Added red to the cycle so the animations include a red hue as requested
const COLORS_TOP = ["#ef4444", "#0ea5e9", "#14b8a6", "#3b82f6"]; // red, sky, teal, blue

function AuroraHero({ onNavigate = () => {} }) {
  const color = useMotionValue(COLORS_TOP[0]);
  const heroRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Use simpler animation if user prefers reduced motion
    const animationDuration = shouldReduceMotion ? 20 : 10;
    const controls = animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: animationDuration,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color, shouldReduceMotion]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
  const dividerBg = useMotionTemplate`${color}`;
  const btnGradient = useMotionTemplate`linear-gradient(90deg, ${color}, #3b82f6 50%, ${color})`;

  // Scroll-linked transitions: top hero fades out; left rail fades in
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.28],
    [1, 0.5, 0]
  );
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -28]);
  const leftOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.28],
    [0, 0.5, 1]
  );
  const leftY = useTransform(scrollYProgress, [0, 0.28], [16, 0]);
  // CTA entrance animation
  const ctaParent = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };
  const ctaItem = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };
  // Removed auth dropdown: single action button now

  const leftRail = {
    hidden: { x: -20, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 140, damping: 18, delay: 0.1 },
    },
  };
  const rightRail = {
    hidden: { x: 20, opacity: 0 },
    show: { x: 0, opacity: 1 },
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      style={{ backgroundImage }}
      className="relative w-full min-h-[100svh] overflow-hidden bg-gray-950 text-gray-200"
      id="hero-section"
      initial="hidden"
      animate="show"
    >
      {/* Background stars - optimized for performance */}
      <div className="absolute inset-0 z-0">
        <Canvas
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Stars radius={50} count={2600} factor={4} fade speed={6} />
        </Canvas>
      </div>
      {/* Top full-screen hero like hover.dev Aurora Hero */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[68svh] md:min-h-[75svh] items-center justify-center"
      >
        <div className="w-full max-w-7xl px-6 md:px-8 lg:px-16">
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="text-center mx-auto"
          >
            <h1
              className="text-5xl md:text-6xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400 animate-gradient bg-[length:200%_auto]">
                Connect. Create.
              </span>
              <br />
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400 animate-gradient bg-[length:200%_auto]">
                Succeed.
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed px-4">
              The ultimate platform for student freelancers to{" "}
              <span className="text-teal-400 font-semibold">find</span> and{" "}
              <span className="text-blue-400 font-semibold">post</span> gigs.
              Start your journey today.
            </p>
            <motion.div
              className="cta-row flex flex-wrap items-center justify-center gap-4 md:gap-6"
              variants={ctaParent}
              initial="hidden"
              animate="show"
            >
              <motion.button
                variants={ctaItem}
                aria-label="Explore gigs"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => scrollToId("gigs")}
                className="group relative bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 bg-[length:200%_auto] text-white px-10 md:px-12 py-4 md:py-5 rounded-full font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:bg-right overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Explore Gigs</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </motion.button>
              
              <motion.button
                variants={ctaItem}
                aria-label="Learn more about Campus Gigs"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToId("about")}
                className="group relative px-10 md:px-12 py-4 md:py-5 rounded-full font-bold border-2 border-teal-400/50 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-400 text-white backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-teal-500/30"
              >
                <span className="flex items-center gap-2">
                  <span>Learn More</span>
                  <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </motion.button>
              
              {/* Single Auth Button (no dropdown) */}
              <motion.div variants={ctaItem} className="relative">
                <motion.button
                  aria-label="Go to Login / Signup"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("login")}
                  className="group relative bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] text-white px-10 md:px-12 py-4 md:py-5 rounded-full font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:bg-right overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <span>Get Started</span>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Social proof badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span>
                <span>Trusted by Universities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-xl">🔒</span>
                <span>Secure Payments</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Animated divider to increase distance between Explore and Our Community */}
      <div className="section-divider my-8 md:my-12" aria-hidden="true" />

      {/* Main content only (left rail removed) */}
      <div className="relative z-10 w-full">
        <div className="w-full">
          {/* Main sections */}
          <div className="w-full space-y-16 md:space-y-24">
            {/* About: full viewport, two-column with animation on the right */}
            <section
              id="about"
              className="relative w-full min-h-screen flex items-center overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="w-full px-6 md:px-12 lg:px-16 py-12 md:py-16 relative z-10">
                <div className="w-full max-w-7xl mx-auto">
                  {/* About content */}
                  <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="text-5xl lg:text-6xl font-black mb-8 leading-tight"
                        >
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                            Campus Gigs
                          </span>
                        </motion.h2>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                          className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-teal-500/20 backdrop-blur-sm mb-8"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-blue-400 rounded-l-2xl"></div>
                          <p className="text-lg md:text-xl font-medium text-gray-300 leading-relaxed">
                            Campus Gigs connects students, teachers, and
                            employers to share knowledge, skills, and
                            opportunities. It makes academic and professional
                            collaboration simple and effective. Students can
                            work on assignments, research papers, and projects
                            to gain real experience. Teachers can post projects
                            and find skilled students for research support.
                            Employers can discover fresh talent for academic or
                            practical work. Campus Gigs bridges the gap between
                            learning and earning — empowering everyone to
                            connect, create, and succeed.
                          </p>
                        </motion.div>
                      </div>

                      {/* Right side - User types cards */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                      >
                        <h3 className="text-2xl font-bold text-white mb-6">
                          Perfect For:
                        </h3>
                        
                        {/* Teacher Card */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border-2 border-blue-500/30 hover:border-blue-400 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center gap-5">
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <img
                                src="https://cdn-icons-gif.flaticon.com/19018/19018081.gif"
                                alt="Teacher animated icon"
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-100 mb-1">Teachers</h4>
                              <p className="text-sm text-gray-400">Post projects & find skilled students</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Student Card */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="group relative p-6 rounded-2xl bg-gradient-to-br from-teal-500/20 via-teal-500/10 to-transparent border-2 border-teal-500/30 hover:border-teal-400 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/0 via-teal-600/5 to-teal-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center gap-5">
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
                                alt="Student animated icon"
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-100 mb-1">Students</h4>
                              <p className="text-sm text-gray-400">Gain experience & earn income</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Employer Card */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="group relative p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/5 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center gap-5">
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <img
                                src="https://cdn-icons-gif.flaticon.com/16664/16664323.gif"
                                alt="Employer animated icon"
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-100 mb-1">Employers</h4>
                              <p className="text-sm text-gray-400">Discover fresh talent & expertise</p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Newsletter section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-cyan-500/10 border border-blue-500/20"
                    >
                      <div className="max-w-3xl mx-auto text-center">
                        <h3 className="text-2xl font-bold text-gray-100 mb-3">Stay Updated</h3>
                        <p className="text-gray-300 mb-6">Join our community and get the latest opportunities delivered to your inbox.</p>
                        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            className="bg-gray-800/80 border-2 border-teal-500/30 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white placeholder-gray-400 shadow-lg flex-grow transition-all duration-300 hover:border-teal-500/50"
                            aria-label="Email for subscription"
                          />
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-10 py-4 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap hover:from-blue-500 hover:to-teal-400"
                          >
                            Subscribe Now →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>
            {/* Explore Gigs */}
            <section
              id="gigs"
              className="w-full px-6 md:px-12 lg:px-16 py-12 md:py-16 bg-transparent"
            >
              <div className="w-full max-w-7xl mx-auto">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-primary-teal mb-10 text-left leading-tight">
                  Explore Gigs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 w-full">
                <div className="p-6 md:p-8 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] isolate">
                  <img
                    src="https://cdn-icons-gif.flaticon.com/15577/15577908.gif"
                    alt="Assignment icon"
                    className="w-16 h-16 mb-4 mix-blend-multiply opacity-95 bg-transparent icon-glow"
                  />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Assignment Help
                  </h3>
                  <p className="text-gray-300 mb-5 leading-relaxed">
                    Get expert assistance with your assignments from skilled
                    student freelancers.
                  </p>
                 
                </div>

                <div className="p-6 md:p-8 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] isolate">
                  <img
                    src="https://cdn-icons-gif.flaticon.com/15577/15577950.gif"
                    alt="Collaboration icon"
                    className="w-16 h-16 mb-4 mix-blend-multiply opacity-95 bg-transparent icon-glow"
                  />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Project Collaboration
                  </h3>
                  <p className="text-gray-300 mb-5 leading-relaxed">
                    Find talented teammates to collaborate on your next big
                    project.
                  </p>
                  
                </div>

                <div className="p-6 md:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] isolate">
                  <img
                    src="https://cdn-icons-gif.flaticon.com/12756/12756533.gif"
                    alt="Data collection icon"
                    className="w-16 h-16 mb-4 mix-blend-multiply opacity-95 bg-transparent icon-glow"
                  />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Data Collection
                  </h3>
                  <p className="text-gray-300 mb-5 leading-relaxed">
                    Collect, clean, and label datasets, run surveys, and gather
                    research data tailored to your needs.
                  </p>
               
                </div>

                <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] isolate">
                  <img
                    src="https://cdn-icons-gif.flaticon.com/19009/19009017.gif"
                    alt="Research icon"
                    className="w-16 h-16 mb-4 mix-blend-multiply opacity-95 bg-transparent icon-glow"
                  />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Research Papers
                  </h3>
                  <p className="text-gray-300 mb-5 leading-relaxed">
                    Get professional help with writing and editing your research
                    papers.
                  </p>
                 
                </div>
              </div>
              </div>
            </section>

            {/* Our Community */}
            <section
              id="community"
              className="w-full px-6 md:px-12 lg:px-16 py-16 md:py-20 bg-transparent"
            >
              <div className="w-full max-w-7xl mx-auto">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-primary-teal mb-14 text-center leading-tight">
                  Our Community
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-12 md:gap-x-16 place-items-center text-center w-full">
                  <div className="relative py-6 px-4">
                    <p className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-4">
                      12,000+
                    </p>
                    <p className="text-lg text-gray-300 mb-5 font-semibold">Active Users</p>
                    <div className="flex justify-center items-center gap-3">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3048/3048122.png"
                        alt="Student avatar icon"
                        className="w-14 h-14 icon-glow bg-transparent hover:scale-110 transition-transform duration-300"
                      />
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/1864/1864593.png"
                        alt="Tutor avatar icon"
                        className="w-14 h-14 icon-glow bg-transparent hover:scale-110 transition-transform duration-300"
                      />
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                        alt="Employer avatar icon"
                        className="w-14 h-14 icon-glow bg-transparent hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="py-6 px-4">
                    <p className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600 mb-4">
                      500+
                    </p>
                    <p className="text-lg text-gray-300 mb-5 font-semibold">Gigs Posted Daily</p>
                    <div className="flex justify-center items-center gap-3 mt-3">
                      <FaPaperPlane
                        className="w-12 h-12 icon-glow bg-transparent text-cyan-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Post icon"
                      />
                      <FaBullhorn
                        className="w-12 h-12 icon-glow bg-transparent text-pink-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Announcement icon"
                      />
                      <FaUpload
                        className="w-12 h-12 icon-glow bg-transparent text-yellow-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Upload icon"
                      />
                    </div>
                  </div>

                  <div className="py-6 px-4">
                    <p className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
                      1,200+
                    </p>
                    <p className="text-lg text-gray-300 mb-5 font-semibold">Projects Completed</p>
                    <div className="flex justify-center items-center gap-3 mt-3">
                      <FaTrophy
                        className="w-12 h-12 icon-glow bg-transparent text-amber-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Trophy icon"
                      />
                      <FaMedal
                        className="w-12 h-12 icon-glow bg-transparent text-emerald-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Medal icon"
                      />
                      <FaClipboardCheck
                        className="w-12 h-12 icon-glow bg-transparent text-blue-400 hover:scale-110 transition-transform duration-300"
                        aria-label="Checklist icon"
                      />
                    </div>
                  </div>
                </div>
                <div className="quote-callout max-w-4xl mx-auto mt-16">
                  <p className="text-xl md:text-2xl font-semibold text-gray-300 leading-relaxed">
                    Join a thriving community of student freelancers and
                    employers. Discover opportunities tailored to your skills!
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <main className="relative z-10 w-full pb-16">
        {/* Full-width: Choose Your Option */}
        <section className="w-full px-6 md:px-12 lg:px-16 py-16 md:py-20 bg-transparent">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-primary-teal mb-6 leading-tight">
                Choose Your Plan
              </h2>
              <div className="quote-callout max-w-4xl mx-auto mt-16">
                <p className="text-xl md:text-2xl font-semibold text-gray-300 leading-relaxed">
                  Select a plan packed with features to elevate your freelancing
                  experience and connect with opportunities.
                </p>
              </div>
            </div>

            <div className="grid max-w-6xl mx-auto grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 mt-10">
            <div className="surface-card p-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-gray-700/50 hover:border-primary-teal/50 transition-all duration-300 hover:shadow-2xl">
              <h3
                id="tier-hobby"
                className="text-2xl font-bold text-primary-teal mb-2"
              >
                Basic
              </h3>
              <p className="mt-6 flex items-baseline gap-x-2">
                <span className="text-5xl font-extrabold text-blue-400">৳99</span>
                <span className="text-lg text-gray-400">/15 days</span>
              </p>
              <p className="mt-6 text-base text-gray-300 leading-relaxed">
                Perfect for students starting their freelancing journey.
              </p>
              <ul
                role="list"
                className="mt-8 space-y-4 text-base text-gray-300"
              >
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Experienced freelancers
                </li>
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Secure payments
                </li>
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Community support
                </li>
              </ul>
              <a
                href="#subscribe"
                aria-describedby="tier-hobby"
                className="mt-10 block rounded-full bg-gradient-to-r from-primary-teal to-primary-blue px-8 py-4 text-center text-base font-bold text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Started
              </a>
            </div>

            <div className="surface-card p-10 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-primary-blue/50 hover:border-primary-blue transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
              <span className="absolute right-6 top-6 text-xs font-bold tracking-wider px-4 py-2 rounded-full bg-gradient-to-r from-primary-blue to-cyan-500 text-white shadow-lg">
                MOST POPULAR
              </span>
              <h3
                id="tier-enterprise"
                className="text-2xl font-bold text-primary-teal mb-2"
              >
                Pro
              </h3>
              <p className="mt-6 flex items-baseline gap-x-2">
                <span className="text-5xl font-extrabold text-blue-400">৳150</span>
                <span className="text-lg text-gray-400">/month</span>
              </p>
              <p className="mt-6 text-base text-gray-300 leading-relaxed">
                Advanced features for professional freelancers.
              </p>
              <ul
                role="list"
                className="mt-8 space-y-4 text-base text-gray-300"
              >
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Everything in Basic
                </li>
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Priority support
                </li>
                <li className="flex gap-x-3 items-center">
                  <span className="text-primary-teal">✓</span> Dedicated account manager
                </li>
              </ul>
              <a
                href="#subscribe"
                aria-describedby="tier-enterprise"
                className="mt-10 block rounded-full bg-gradient-to-r from-primary-blue to-cyan-500 px-8 py-4 text-center text-base font-bold text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Started
              </a>
            </div>
            </div>
          </div>
        </section>
      </main>

      {/* Animated divider before footer */}
      <div className="section-divider my-8 md:my-12" aria-hidden="true" />

      <div className="relative z-10">
        <Footer />
      </div>
    </motion.section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AuroraHero);
