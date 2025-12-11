import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import ProjectSubmissionForm from '../components/ProjectSubmissionForm';

export default function MyProjects() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadUserProjects();
  }, [currentUser]);

  const loadUserProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'projects'),
        where('authorUID', '==', currentUser.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProjects(projectsData);

      // Calculate stats
      const totalReviews = projectsData.reduce((sum, p) => sum + (p.totalReviews || 0), 0);
      const totalRating = projectsData.reduce((sum, p) => sum + (p.averageRating || 0) * (p.totalReviews || 0), 0);
      const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      setStats({
        totalProjects: projectsData.length,
        totalReviews,
        averageRating: avgRating
      });
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // Extract shareable ID from the shareableLink
      const shareableId = project.shareableLink.split('/').pop();
      navigate(`/project/${shareableId}/share`);
    }
  };

  const handleArchive = async (projectId) => {
    if (!window.confirm('Are you sure you want to archive this project? You can always restore it later.')) {
      return;
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        status: 'archived'
      });

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setStats(prev => ({
        ...prev,
        totalProjects: prev.totalProjects - 1
      }));
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Failed to archive project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar showAuthButtons={false} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="bg-slate-mist bg-opacity-5 rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-mist mb-2">
                My Projects
              </h1>
              <p className="text-slate-mist text-opacity-70">
                Manage your submissions and track feedback
              </p>
            </div>
            <button
              onClick={() => setShowProjectForm(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-mint"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post New Project</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-carbon-base rounded-xl p-6">
              <div className="text-mint-pulse text-4xl font-bold mb-2">
                {stats.totalProjects}
              </div>
              <div className="text-slate-mist text-opacity-70">Projects Posted</div>
            </div>
            <div className="bg-carbon-base rounded-xl p-6">
              <div className="text-mint-pulse text-4xl font-bold mb-2">
                {stats.totalReviews}
              </div>
              <div className="text-slate-mist text-opacity-70">Total Reviews</div>
            </div>
            <div className="bg-carbon-base rounded-xl p-6">
              <div className="text-mint-pulse text-4xl font-bold mb-2">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
              </div>
              <div className="text-slate-mist text-opacity-70">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-12 w-12 text-mint-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                showActions={true}
                onShare={handleShare}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-slate-mist text-opacity-20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-slate-mist mb-2">No Projects Yet</h3>
            <p className="text-slate-mist text-opacity-70 mb-6">
              Start your journey by posting your first project!
            </p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-8 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-mint"
            >
              Post Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Project Submission Form Modal */}
      <ProjectSubmissionForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSuccess={loadUserProjects}
      />

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowProjectForm(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-mint-pulse text-carbon-base rounded-full shadow-mint-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 z-40"
        aria-label="Post new project"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
