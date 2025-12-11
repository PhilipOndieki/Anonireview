import { Link } from 'react-router-dom';

export default function ProjectCard({ project, rank, showActions = false, onShare, onArchive }) {
  const {
    id,
    title,
    description,
    thumbnailURL,
    techStack = [],
    averageRating = 0,
    totalReviews = 0,
    views = 0,
  } = project;

  // Default gradient for projects without thumbnails
  const defaultGradient = `linear-gradient(135deg, #2B2D33 0%, #3D4048 50%, #2B2D33 100%)`;

  return (
    <div className="bg-carbon-base rounded-2xl overflow-hidden shadow-dark hover:shadow-dark-lg hover:-translate-y-1 transition-all duration-300 group">
      {/* Thumbnail Section */}
      <div className="relative h-48 w-full overflow-hidden">
        {thumbnailURL ? (
          <img
            src={thumbnailURL}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            style={{ background: defaultGradient }}
            className="w-full h-full flex items-center justify-center"
          >
            <svg
              className="w-20 h-20 text-slate-mist opacity-20"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
        )}

        {/* Rank Badge (for leaderboard) */}
        {rank && (
          <div className="absolute -bottom-6 left-4 z-10 w-12 h-12 bg-mint-pulse rounded-full flex items-center justify-center shadow-mint">
            <span className="text-carbon-base text-lg font-bold">#{rank}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 pt-8">
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-mint-pulse text-3xl font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <span className="text-slate-mist text-opacity-60 text-base">/10</span>
          </div>
          {averageRating > 0 && (
            <div className="flex space-x-0.5" aria-label={`Rating: ${averageRating} out of 10`}>
              {[...Array(5)].map((_, i) => {
                const fillPercentage = Math.min(Math.max((averageRating / 2 - i) * 100, 0), 100);
                return (
                  <div key={i} className="relative w-5 h-5">
                    <svg
                      className="w-5 h-5 text-slate-mist text-opacity-20"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {fillPercentage > 0 && (
                      <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{ width: `${fillPercentage}%` }}
                      >
                        <svg
                          className="w-5 h-5 text-mint-pulse"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Title */}
        <h3 className="text-slate-mist text-xl font-semibold mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-slate-mist text-opacity-70 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tech Stack Tags */}
        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {techStack.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium text-slate-mist bg-carbon-base border border-slate-mist border-opacity-20 rounded-full"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 3 && (
              <span className="px-3 py-1 text-xs font-medium text-slate-mist text-opacity-60">
                +{techStack.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center space-x-4 text-slate-mist text-opacity-70 text-sm mb-4">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{views} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>{totalReviews} reviews</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/review/${id}`}
            className="flex-1 text-center px-4 py-2 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse"
          >
            View Reviews
          </Link>

          {showActions && (
            <button
              onClick={() => onShare && onShare(id)}
              className="px-4 py-2 border border-mint-pulse text-mint-pulse rounded-lg hover:bg-mint-pulse hover:text-carbon-base transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse"
              aria-label="Share project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
