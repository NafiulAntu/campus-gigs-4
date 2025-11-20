import React from "react";
import { FaFacebook, FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent to-gray-900/50 py-16 md:py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                Campus Gigs
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              Where ideas meet opportunity. Empowering students to turn skills into success through real-world experience.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold">
                12K+ Users
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 font-semibold">
                Trusted
              </span>
            </div>
          </div>
          {/* Explore Section */}
          <div>
            <h4 className="text-primary-teal font-bold text-2xl md:text-3xl mb-6">Explore</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#gigs"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                  Explore Gigs
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#subscription"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                  Subscription
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                  About
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Section */}
          <div>
            <h4 className="text-primary-teal font-bold text-2xl md:text-3xl mb-6">Developer</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/docs"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-blue-400 group-hover:w-4 transition-all duration-300"></span>
                  API Docs
                </a>
              </li>
              <li>
                <a
                  href="/contributors"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-blue-400 group-hover:w-4 transition-all duration-300"></span>
                  Contribute
                </a>
              </li>
              <li>
                <a
                  href="/changelog"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-blue-400 group-hover:w-4 transition-all duration-300"></span>
                  Changelog
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-base flex items-center gap-2 group font-semibold"
                >
                  <span className="w-0 h-px bg-blue-400 group-hover:w-4 transition-all duration-300"></span>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="text-primary-teal font-bold text-2xl md:text-3xl mb-6">Connect</h4>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-text-muted hover:text-primary-teal transition-colors duration-300"
                title="Facebook"
              >
                <FaFacebook className="w-10 h-10 icon-glow bg-transparent" />
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-text-muted hover:text-primary-teal transition-colors duration-300"
                title="GitHub"
              >
                <FaGithub className="w-10 h-10 icon-glow bg-transparent" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="text-text-muted hover:text-primary-teal transition-colors duration-300"
                title="X (Twitter)"
              >
                <FaXTwitter className="w-10 h-10 icon-glow bg-transparent" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-text-muted hover:text-primary-teal transition-colors duration-300"
                title="LinkedIn"
              >
                <FaLinkedin className="w-10 h-10 icon-glow bg-transparent" />
              </a>
            </div>
            <div className="space-y-2">
              <a
                href="mailto:support@campusgigs.com"
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors text-base group font-semibold"
              >
                <MdEmail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                support@campusgigs.com
              </a>
              <a
                href="mailto:devs@campusgigs.com"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors text-base group font-semibold"
              >
                <MdEmail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                devs@campusgigs.com
              </a>
            </div>
          </div>
        </div>

        {/* Animated Divider */}
        <div className="relative pt-8 mt-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 animate-gradient-x opacity-70"></div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-base text-gray-400 font-semibold">
              © 2025 Campus Gigs. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-base">
              <a href="/terms" className="text-gray-400 hover:text-teal-400 transition-colors font-semibold">
                Terms
              </a>
              <a href="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors font-semibold">
                Privacy
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-teal-400 transition-colors font-semibold">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
