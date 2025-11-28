import React, { useState, useEffect, useRef } from "react";
import NotificationBell from "../Notifications/NotificationBell";

export default function Header({
  onNavigate = () => {},
  onToggleSearch,
  view,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuPanelRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  // add/remove body class to prevent scrolling when menu open on mobile
  // Only lock body scroll when the mobile overlay is opened on small screens
  useEffect(() => {
    const smallScreen =
      typeof window !== "undefined" && window.innerWidth < 1024;
    if (menuOpen && smallScreen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  // close desktop menu when clicking outside
  // (desktop dropdown removed) keep other effects below

  // focus first menu item when mobile menu opens and handle Escape
  useEffect(() => {
    if (menuOpen) {
      // small delay to wait for animation
      setTimeout(() => {
        if (firstMenuItemRef.current) firstMenuItemRef.current.focus();
      }, 80);
    }
  }, [menuOpen]);

  // close menu on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" || e.key === "Esc") {
        setMenuOpen(false);
      }
    }
    if (typeof window !== "undefined")
      window.addEventListener("keydown", onKey);
    return () =>
      typeof window !== "undefined" &&
      window.removeEventListener("keydown", onKey);
  }, []);

  // hide header on scroll down, show on scroll up
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  useEffect(() => {
    const lastY = { value: typeof window !== "undefined" ? window.scrollY : 0 };
    const ticking = { value: false };

    function onScroll() {
      if (menuOpen) {
        // when menu is open keep header visible
        if (hiddenOnScroll) setHiddenOnScroll(false);
        lastY.value = window.scrollY;
        return;
      }

      const current = window.scrollY;
      if (!ticking.value) {
        window.requestAnimationFrame(() => {
          // small threshold to avoid flicker
          const delta = current - lastY.value;
          if (delta > 12 && current > 80) {
            // scrolled down
            setHiddenOnScroll(true);
          } else if (delta < -12) {
            // scrolled up
            setHiddenOnScroll(false);
          }
          lastY.value = current;
          ticking.value = false;
        });
        ticking.value = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen, hiddenOnScroll]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-auto transition-all duration-300">
      <div className="backdrop-blur-lg bg-primary-dark/40">
        <div
          className={`container mx-auto flex items-center justify-between ${
            hiddenOnScroll ? "py-2" : "py-4"
          } px-4 lg:px-6 transition-all duration-300`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onNavigate("home");
                setMenuOpen(false);
              }}
              aria-label="Campus Gigs Home"
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xl font-bold text-white">Campus Gigs</div>
              <div className="text-xs text-text-muted">
                Connect, Collaborate, Succeed
              </div>
            </button>
          </div>

          {/* Desktop nav links 
          <nav className="hidden lg:flex items-center gap-6">
            <a
              onClick={() => onNavigate("home")}
              className="text-text-light hover:text-primary-teal cursor-pointer"
            >
              Home
            </a>
            <a
              onClick={() => onNavigate("jobs")}
              className="text-text-light hover:text-primary-teal cursor-pointer"
            >
              Jobs
            </a>
            <a
              onClick={() => onNavigate("subscription")}
              className="text-text-light hover:text-primary-teal cursor-pointer"
            >
              Subscription
            </a>

            // Desktop: no 'Menu' option — full nav links are shown on large screens 
           
           
            <button
              onClick={() => onNavigate("login")}
              className={`bg-gradient-to-r from-primary-blue to-primary-teal text-white rounded-full ${hiddenOnScroll ? "px-3 py-1 text-sm" : "px-4 py-2"}`}
            >
              Login / Signup
            </button>
          </nav>
          */}

          {/* Desktop nav (visible on large screens) - aligned to the right */}
          <nav className="hidden lg:flex items-center gap-6 ml-auto">
            <button
              onClick={() => {
                onNavigate("home");
                setMenuOpen(false);
              }}
              className="text-text-light hover:text-primary-teal cursor-pointer"
              aria-label="Home"
            >
              Home
            </button>

            <button
              onClick={() => {
                onNavigate("subscription");
                setMenuOpen(false);
              }}
              className="text-text-light hover:text-primary-teal cursor-pointer"
              aria-label="Subscription"
            >
              Subscription
            </button>

            {/* Inline search trigger shown on Post page */}
            {view === "post" && (
              <button
                type="button"
                onClick={() => onToggleSearch && onToggleSearch()}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-text-muted hover:text-white hover:bg-white/10"
                aria-label="Search"
              >
                <i className="fi fi-br-search" />
                <span>Search</span>
              </button>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            <button
              onClick={() => onNavigate("login")}
              className={`ml-2 bg-gradient-to-r from-primary-blue to-primary-teal text-white rounded-full ${
                hiddenOnScroll ? "px-3 py-1 text-sm" : "px-4 py-2"
              }`}
            >
              Login / Signup
            </button>
          </nav>

          {/* Menu button (visible on small screens only) */}
          <div>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-blue to-primary-teal text-white shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-teal/30"
            >
              <span className="sr-only">Toggle menu</span>
              {menuOpen ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile popup menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
        <div
          ref={menuPanelRef}
          role="dialog"
          aria-modal={true}
          aria-label="Main menu"
          className={`relative bg-card-bg/95 backdrop-blur-lg border-t border-primary-blue/10 p-4 rounded-b-xl max-h-[80vh] overflow-auto mobile-overlay-panel ${
            menuOpen ? "open" : ""
          }`}
        >
          {/* Panel header: logo + close */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-start gap-1">
              <div className="text-lg font-bold text-white">Campus Gigs</div>
              <div className="text-xs text-text-muted">
                Connect, Collaborate, Succeed
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-primary-dark/20 focus:outline-none focus:ring-2 focus:ring-primary-teal/30"
            >
              <svg
                className="w-5 h-5 text-text-light"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-3">
            <div className="grid gap-2">
              <button
                ref={firstMenuItemRef}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("home");
                }}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-primary-dark/20 focus:outline-none focus:bg-primary-dark/20"
              >
                <svg
                  className="w-5 h-5 text-primary-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 12l9-8 9 8v7a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-7z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-lg text-text-light">Home</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("jobs");
                }}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-primary-dark/20 focus:outline-none focus:bg-primary-dark/20"
              >
                <svg
                  className="w-5 h-5 text-primary-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m8 0H8m8 0v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8m8 0H8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-lg text-text-light">Jobs</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("subscription");
                }}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-primary-dark/20 focus:outline-none focus:bg-primary-dark/20"
              >
                <svg
                  className="w-5 h-5 text-primary-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M21 8V7a2 2 0 0 0-2-2h-3l-2-3H10L8 5H5a2 2 0 0 0-2 2v1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-lg text-text-light">Subscription</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* bottom quick-access bar removed per request */}
    </header>
  );
}
