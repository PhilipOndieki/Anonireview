import { useState } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar onSignInClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right bottom, rgba(43, 45, 51, 0.5), rgba(43, 45, 51, 0.6)), url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-mist mb-6 leading-tight tracking-tight text-shadow-lg">
            Get Honest Feedback.
            <br />
            Build Better Projects.
          </h1>

          <button
            onClick={handleGetStarted}
            className="mt-8 px-12 py-4 bg-mint-pulse text-carbon-base rounded-lg text-lg font-semibold hover:scale-105 shadow-mint transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse focus-visible:ring-offset-4 focus-visible:ring-offset-carbon-base"
            aria-label="Get started with AnoniReview"
          >
            Get Started
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <svg
            className="w-10 h-10 text-slate-mist opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-mist py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-carbon-base text-center mb-12 md:mb-16">
            How AnoniReview Works
          </h2>

          {/* Three-Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="bg-carbon-base rounded-xl p-8 shadow-dark hover:shadow-dark-lg transition-shadow duration-300">
              <div className="text-mint-pulse text-5xl font-bold mb-4">1</div>
              <h3 className="text-slate-mist text-2xl font-semibold mb-3">
                Register & Post
              </h3>
              <p className="text-slate-mist text-opacity-80 leading-relaxed">
                Create your account and submit your project with a link and description.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-carbon-base rounded-xl p-8 shadow-dark hover:shadow-dark-lg transition-shadow duration-300">
              <div className="text-mint-pulse text-5xl font-bold mb-4">2</div>
              <h3 className="text-slate-mist text-2xl font-semibold mb-3">
                Share Anonymously
              </h3>
              <p className="text-slate-mist text-opacity-80 leading-relaxed">
                Get a unique shareable link to distribute via WhatsApp, Twitter, or any platform.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-carbon-base rounded-xl p-8 shadow-dark hover:shadow-dark-lg transition-shadow duration-300">
              <div className="text-mint-pulse text-5xl font-bold mb-4">3</div>
              <h3 className="text-slate-mist text-2xl font-semibold mb-3">
                Receive Honest Feedback
              </h3>
              <p className="text-slate-mist text-opacity-80 leading-relaxed">
                Anonymous users rate your project out of 10 and provide constructive reviews.
              </p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-carbon-base text-xl md:text-2xl font-medium leading-relaxed">
              Positive criticism builds better developers. Get unbiased feedback that actually improves your skills.
            </p>
          </div>

          {/* Secondary CTA */}
          <div className="text-center">
            <button
              onClick={handleGetStarted}
              className="px-12 py-4 bg-mint-pulse text-carbon-base rounded-lg text-lg font-semibold hover:scale-105 shadow-mint transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse focus-visible:ring-offset-4 focus-visible:ring-offset-slate-mist"
              aria-label="Join the community"
            >
              Join the Community
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-carbon-base border-t border-slate-mist border-opacity-10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-mist text-opacity-60 text-sm">
              © 2024 AnoniReview. Building better developers through honest feedback.
            </p>
            <div className="flex space-x-6">
              <a
                href="/leaderboard"
                className="text-slate-mist text-opacity-60 hover:text-mint-pulse transition-colors duration-200 text-sm"
              >
                Leaderboard
              </a>
              <a
                href="#"
                className="text-slate-mist text-opacity-60 hover:text-mint-pulse transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-mist text-opacity-60 hover:text-mint-pulse transition-colors duration-200 text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
