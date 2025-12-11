import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import crypto from 'crypto-js';

export default function ReviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, highest, lowest, helpful

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    loadProjectAndReviews();
    checkIfAlreadyReviewed();
  }, [projectId]);

  useEffect(() => {
    if (reviews.length > 0) {
      sortReviews();
    }
  }, [sortBy]);

  const loadProjectAndReviews = async () => {
    try {
      setLoading(true);

      // Find project by shareable link
      const projectsQuery = query(
        collection(db, 'projects'),
        where('shareableLink', '==', `${window.location.origin}/review/${projectId}`)
      );

      const projectSnapshot = await getDocs(projectsQuery);

      if (projectSnapshot.empty) {
        navigate('/');
        return;
      }

      const projectDoc = projectSnapshot.docs[0];
      const projectData = {
        id: projectDoc.id,
        ...projectDoc.data()
      };

      setProject(projectData);

      // Increment view count
      await updateDoc(doc(db, 'projects', projectDoc.id), {
        views: increment(1)
      });

      // Load reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('projectID', '==', projectDoc.id),
        where('status', '==', 'published'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfAlreadyReviewed = () => {
    // Create a hash of the IP address (in production, you'd get this from the backend)
    // For demo purposes, we use a simple browser fingerprint
    const fingerprint = navigator.userAgent + navigator.language;
    const ipHash = crypto.SHA256(fingerprint).toString();

    // Check localStorage to see if this user already reviewed
    const reviewedProjects = JSON.parse(localStorage.getItem('reviewedProjects') || '{}');
    if (reviewedProjects[projectId]) {
      setAlreadyReviewed(true);
    }
  };

  const sortReviews = () => {
    const sorted = [...reviews];

    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      default:
        break;
    }

    setReviews(sorted);
  };

  const validateReview = () => {
    const newErrors = {};

    if (reviewText.trim().length < 50) {
      newErrors.reviewText = 'Review must be at least 50 characters';
    } else if (reviewText.length > 1000) {
      newErrors.reviewText = 'Review must be 1000 characters or less';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the anonymous review policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!validateReview() || alreadyReviewed) return;

    setSubmitting(true);

    try {
      // Create IP hash for duplicate prevention
      const fingerprint = navigator.userAgent + navigator.language;
      const ipHash = crypto.SHA256(fingerprint).toString();

      // Submit review
      await addDoc(collection(db, 'reviews'), {
        projectID: project.id,
        rating,
        reviewText: reviewText.trim(),
        timestamp: serverTimestamp(),
        ipHash,
        helpfulCount: 0,
        flagCount: 0,
        status: 'published'
      });

      // Update project stats
      const newTotalReviews = (project.totalReviews || 0) + 1;
      const newAverageRating =
        ((project.averageRating || 0) * (project.totalReviews || 0) + rating) / newTotalReviews;

      await updateDoc(doc(db, 'projects', project.id), {
        totalReviews: increment(1),
        averageRating: newAverageRating
      });

      // Mark as reviewed in localStorage
      const reviewedProjects = JSON.parse(localStorage.getItem('reviewedProjects') || '{}');
      reviewedProjects[projectId] = true;
      localStorage.setItem('reviewedProjects', JSON.stringify(reviewedProjects));

      // Reload reviews
      await loadProjectAndReviews();

      // Reset form
      setRating(5);
      setReviewText('');
      setAgreedToTerms(false);
      setAlreadyReviewed(true);

      // Scroll to reviews
      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      // Check if already marked helpful
      const helpfulReviews = JSON.parse(localStorage.getItem('helpfulReviews') || '{}');
      if (helpfulReviews[reviewId]) {
        return;
      }

      await updateDoc(doc(db, 'reviews', reviewId), {
        helpfulCount: increment(1)
      });

      // Mark as helpful in localStorage
      helpfulReviews[reviewId] = true;
      localStorage.setItem('helpfulReviews', JSON.stringify(helpfulReviews));

      // Update local state
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      );
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-base flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-mint-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-carbon-base flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-mist mb-2">Project Not Found</h2>
          <p className="text-slate-mist text-opacity-70 mb-6">This project doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:scale-105 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar onSignInClick={() => setShowAuthModal(true)} />

      {/* Project Header */}
      <section className="bg-carbon-base pt-24 pb-12 border-b border-slate-mist border-opacity-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Thumbnail */}
          {project.thumbnailURL && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={project.thumbnailURL}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Project Info */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-mist mb-4">
              {project.title}
            </h1>
            <p className="text-slate-mist text-opacity-60 mb-4">
              By Anonymous Developer
            </p>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium text-slate-mist bg-slate-mist bg-opacity-10 border border-mint-pulse rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-slate-mist text-opacity-80 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
              {project.description}
            </p>

            {/* Visit Project Button */}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:scale-105 transition-all shadow-mint"
            >
              Visit Project
            </a>

            {/* View Count */}
            <div className="mt-6 text-slate-mist text-opacity-60 text-sm">
              <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {project.views || 0} views
            </div>
          </div>
        </div>
      </section>

      {/* Rating & Review Section */}
      <section className="bg-slate-mist py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Average Rating Display */}
          {project.averageRating > 0 && (
            <div className="text-center mb-12">
              <div className="text-6xl font-bold text-carbon-base mb-2">
                {project.averageRating.toFixed(1)}
                <span className="text-3xl text-carbon-base text-opacity-60">/10</span>
              </div>
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => {
                  const fillPercentage = Math.min(Math.max((project.averageRating / 2 - i) * 100, 0), 100);
                  return (
                    <div key={i} className="relative w-8 h-8">
                      <svg className="w-8 h-8 text-carbon-base text-opacity-20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {fillPercentage > 0 && (
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                          <svg className="w-8 h-8 text-mint-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-carbon-base text-opacity-70">({project.totalReviews || 0} reviews)</p>
            </div>
          )}

          {/* Leave a Review Form */}
          {!alreadyReviewed ? (
            <div className="bg-carbon-base rounded-2xl p-6 md:p-8 mb-12 shadow-dark">
              <h2 className="text-2xl font-bold text-slate-mist mb-6">Leave Your Review</h2>

              <form onSubmit={handleSubmitReview}>
                {/* Rating Slider */}
                <div className="mb-6">
                  <label className="block text-slate-mist font-semibold mb-4">
                    Rate this project
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full h-3 bg-slate-mist bg-opacity-20 rounded-lg appearance-none cursor-pointer accent-mint-pulse"
                      style={{
                        background: `linear-gradient(to right, #72F5C9 0%, #72F5C9 ${(rating - 1) * 11.11}%, rgba(232, 235, 240, 0.2) ${(rating - 1) * 11.11}%, rgba(232, 235, 240, 0.2) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-slate-mist text-opacity-60 text-sm mt-2">
                      <span>1</span>
                      <span className="text-mint-pulse text-3xl font-bold">{rating}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label htmlFor="reviewText" className="block text-slate-mist font-semibold mb-2">
                    Your honest feedback
                  </label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={6}
                    maxLength={1000}
                    placeholder="What did you like? What could be improved? Be constructive and specific..."
                    className={`w-full px-4 py-3 bg-slate-mist bg-opacity-10 text-slate-mist border ${
                      errors.reviewText ? 'border-red-500' : 'border-slate-mist border-opacity-20'
                    } rounded-lg focus:outline-none focus:border-mint-pulse focus:ring-2 focus:ring-mint-pulse transition-colors resize-none`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.reviewText ? (
                      <span className="text-red-500 text-sm">{errors.reviewText}</span>
                    ) : (
                      <span className="text-slate-mist text-opacity-60 text-sm">
                        {reviewText.length}/1000 characters (min 50)
                      </span>
                    )}
                  </div>
                </div>

                {/* Anonymous Confirmation */}
                <div className="mb-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-mint-pulse bg-slate-mist bg-opacity-10 border-slate-mist border-opacity-20 rounded focus:ring-2 focus:ring-mint-pulse"
                    />
                    <span className="text-slate-mist text-opacity-80 text-sm">
                      I understand my review will be posted anonymously and I agree to provide constructive feedback
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="text-red-500 text-sm block mt-2">{errors.terms}</span>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-mint-pulse text-carbon-base rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-mint-pulse bg-opacity-10 border-2 border-mint-pulse rounded-2xl p-6 mb-12 text-center">
              <svg className="w-16 h-16 text-mint-pulse mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-mist mb-2">Thank You!</h3>
              <p className="text-slate-mist text-opacity-70">
                You've already reviewed this project. Check out your review below!
              </p>
            </div>
          )}

          {/* Existing Reviews */}
          <div id="reviews-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-carbon-base">
                Community Reviews ({reviews.length})
              </h2>

              {/* Sort Dropdown */}
              {reviews.length > 0 && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-carbon-base text-slate-mist border border-slate-mist border-opacity-20 rounded-lg focus:outline-none focus:border-mint-pulse"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              )}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-carbon-base rounded-xl p-6 shadow-dark hover:shadow-dark-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-mint-pulse rounded-full flex items-center justify-center text-carbon-base font-bold text-lg">
                          {review.rating}
                        </div>
                        <div className="flex space-x-0.5">
                          {[...Array(5)].map((_, i) => {
                            const fillPercentage = Math.min(Math.max((review.rating / 2 - i) * 100, 0), 100);
                            return (
                              <div key={i} className="relative w-5 h-5">
                                <svg className="w-5 h-5 text-slate-mist text-opacity-20" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {fillPercentage > 0 && (
                                  <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                                    <svg className="w-5 h-5 text-mint-pulse" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <span className="text-slate-mist text-opacity-50 text-sm">
                        {review.timestamp?.toDate?.().toLocaleDateString() || 'Recently'}
                      </span>
                    </div>

                    <p className="text-slate-mist leading-relaxed mb-4">{review.reviewText}</p>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center space-x-2 text-slate-mist text-opacity-70 hover:text-mint-pulse transition-colors text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>Helpful ({review.helpfulCount || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-carbon-base rounded-xl">
                <svg className="w-16 h-16 text-slate-mist text-opacity-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-bold text-slate-mist mb-2">No Reviews Yet</h3>
                <p className="text-slate-mist text-opacity-70">
                  Be the first to review this project!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
