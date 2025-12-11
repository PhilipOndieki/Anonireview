import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import AuthModal from '../components/AuthModal';

export default function Leaderboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('all'); // all, month, week
  const [category, setCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [timePeriod, category]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      let q = query(
        collection(db, 'projects'),
        where('status', '==', 'active'),
        where('totalReviews', '>', 0)
      );

      // Add time filter if needed
      if (timePeriod !== 'all') {
        const now = new Date();
        const cutoff = new Date();

        if (timePeriod === 'week') {
          cutoff.setDate(now.getDate() - 7);
        } else if (timePeriod === 'month') {
          cutoff.setMonth(now.getMonth() - 1);
        }

        q = query(q, where('createdAt', '>=', cutoff));
      }

      q = query(q, orderBy('averageRating', 'desc'), orderBy('totalReviews', 'desc'), limit(20));

      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar onSignInClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section className="bg-carbon-base border-b border-slate-mist border-opacity-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-mist mb-4">
            Top Projects
          </h1>
          <p className="text-slate-mist text-opacity-70 text-lg md:text-xl max-w-2xl mx-auto">
            Discover the highest-rated developer projects {timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'of all time'}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-mist py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Time Period Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-carbon-base font-semibold mr-2">Time:</span>
              {['all', 'month', 'week'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    timePeriod === period
                      ? 'bg-mint-pulse text-carbon-base shadow-mint'
                      : 'bg-carbon-base text-slate-mist hover:bg-opacity-80'
                  }`}
                >
                  {period === 'all' ? 'All Time' : period === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-carbon-base text-opacity-70">
              {loading ? 'Loading...' : `${projects.length} projects`}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="bg-slate-mist py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg className="animate-spin h-12 w-12 text-mint-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : projects.length > 0 ? (
            <>
              {/* Top 3 Projects (Podium) */}
              {projects.length >= 3 && (
                <div className="mb-16">
                  <h2 className="text-2xl md:text-3xl font-bold text-carbon-base mb-8 text-center">
                    Top 3 Projects
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2nd Place */}
                    <div className="lg:order-1 transform lg:translate-y-8">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-400 rounded-full flex items-center justify-center shadow-lg z-10">
                          <span className="text-carbon-base text-xl font-bold">🥈</span>
                        </div>
                        <ProjectCard project={projects[1]} rank={2} />
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="lg:order-2">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10 animate-pulse">
                          <span className="text-carbon-base text-2xl font-bold">🏆</span>
                        </div>
                        <div className="border-4 border-mint-pulse rounded-2xl">
                          <ProjectCard project={projects[0]} rank={1} />
                        </div>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="lg:order-3 transform lg:translate-y-8">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center shadow-lg z-10">
                          <span className="text-carbon-base text-xl font-bold">🥉</span>
                        </div>
                        <ProjectCard project={projects[2]} rank={3} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Projects */}
              {projects.length > 3 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-carbon-base mb-8">
                    More Great Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.slice(3).map((project, index) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        rank={index + 4}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Single or Two Projects */}
              {projects.length < 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-carbon-base text-opacity-20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-2xl font-bold text-carbon-base mb-2">No Projects Found</h3>
              <p className="text-carbon-base text-opacity-70 mb-6">
                Be the first to post a project and get featured on the leaderboard!
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-mint"
              >
                Post Your Project
              </button>
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
