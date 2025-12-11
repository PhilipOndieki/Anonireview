import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onSignInClick, showAuthButtons = true }) {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-carbon-base bg-opacity-95 backdrop-blur-sm border-b border-slate-mist border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse rounded"
            aria-label="AnoniReview Home"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-mint-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-1.13-6-5.16-6-8.5V8.3l6-3.11 6 3.11v3.2c0 3.34-2.14 7.37-6 8.5z"/>
              <path d="M12 11.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.3L12 5.19 19 8.3V12h-7v-.01z" opacity="0.3"/>
            </svg>
            <span className="text-slate-mist text-xl md:text-2xl font-bold tracking-tight">
              AnoniReview
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Leaderboard Link (always visible) */}
            <Link
              to="/leaderboard"
              className="hidden sm:block text-slate-mist hover:text-mint-pulse transition-colors duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse rounded px-2 py-1"
            >
              Leaderboard
            </Link>

            {!currentUser && showAuthButtons ? (
              // Unauthenticated - Show Sign Up / Sign In
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSignInClick}
                  className="hidden sm:block px-4 py-2 border border-slate-mist text-slate-mist rounded-lg hover:bg-mint-pulse hover:text-carbon-base hover:border-mint-pulse transition-all duration-200 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse"
                  aria-label="Sign Up"
                >
                  Sign Up
                </button>
                <button
                  onClick={onSignInClick}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-mint-pulse text-carbon-base rounded-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-200 font-semibold shadow-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-base"
                  aria-label="Sign In"
                >
                  Sign In
                </button>
              </div>
            ) : currentUser ? (
              // Authenticated - Show user menu
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 md:space-x-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse rounded-full"
                  aria-label="User menu"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full border-2 border-mint-pulse"
                  />
                  <span className="hidden md:block text-slate-mist font-medium max-w-[150px] truncate">
                    {currentUser.displayName}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-mist transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                      aria-hidden="true"
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-carbon-base border border-slate-mist border-opacity-20 rounded-lg shadow-dark-lg overflow-hidden z-20">
                      <Link
                        to="/my-projects"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-3 text-slate-mist hover:bg-mint-pulse hover:text-carbon-base transition-colors duration-200 focus:outline-none focus-visible:bg-mint-pulse focus-visible:text-carbon-base"
                      >
                        My Projects
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-3 text-slate-mist hover:bg-mint-pulse hover:text-carbon-base transition-colors duration-200 focus:outline-none focus-visible:bg-mint-pulse focus-visible:text-carbon-base"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-slate-mist hover:bg-mint-pulse hover:text-carbon-base transition-colors duration-200 focus:outline-none focus-visible:bg-mint-pulse focus-visible:text-carbon-base"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
