import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectSubmissionForm from '../components/ProjectSubmissionForm';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar showAuthButtons={false} />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-mist mb-2">
            Welcome back, {currentUser?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-slate-mist text-opacity-70">
            Post your projects and get valuable feedback from the community
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Post Project Card */}
          <button
            onClick={() => setShowProjectForm(true)}
            className="bg-mint-pulse text-carbon-base p-8 rounded-2xl shadow-mint hover:scale-105 transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Post a Project</h3>
            <p className="text-carbon-base text-opacity-70">
              Share your work and get anonymous feedback
            </p>
          </button>

          {/* My Projects Card */}
          <a
            href="/my-projects"
            className="bg-carbon-base border-2 border-mint-pulse p-8 rounded-2xl hover:shadow-mint transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 text-mint-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <svg className="w-6 h-6 text-mint-pulse group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-mist mb-2">My Projects</h3>
            <p className="text-slate-mist text-opacity-70">
              View and manage all your submissions
            </p>
          </a>

          {/* Leaderboard Card */}
          <a
            href="/leaderboard"
            className="bg-carbon-base border-2 border-slate-mist border-opacity-20 p-8 rounded-2xl hover:border-mint-pulse hover:shadow-mint transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 text-mint-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <svg className="w-6 h-6 text-slate-mist group-hover:text-mint-pulse group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-mist mb-2">Leaderboard</h3>
            <p className="text-slate-mist text-opacity-70">
              Discover top-rated projects
            </p>
          </a>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-slate-mist bg-opacity-5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-mist mb-6">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-mint-pulse rounded-full flex items-center justify-center text-carbon-base font-bold">
                1
              </div>
              <div>
                <h3 className="text-slate-mist font-semibold mb-1">Post Your First Project</h3>
                <p className="text-slate-mist text-opacity-70 text-sm">
                  Click "Post a Project" above to share your work with the community
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-mist bg-opacity-20 rounded-full flex items-center justify-center text-slate-mist font-bold">
                2
              </div>
              <div>
                <h3 className="text-slate-mist font-semibold mb-1">Share Your Link</h3>
                <p className="text-slate-mist text-opacity-70 text-sm">
                  Get a unique shareable link and distribute it on social media
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-mist bg-opacity-20 rounded-full flex items-center justify-center text-slate-mist font-bold">
                3
              </div>
              <div>
                <h3 className="text-slate-mist font-semibold mb-1">Receive Anonymous Feedback</h3>
                <p className="text-slate-mist text-opacity-70 text-sm">
                  Get honest reviews from developers around the world
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Submission Form Modal */}
      <ProjectSubmissionForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
      />
    </div>
  );
}
