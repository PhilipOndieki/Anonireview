import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';

export default function ShareableLinkPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);

      const projectsQuery = query(
        collection(db, 'projects'),
        where('shareableLink', '==', `${window.location.origin}/review/${projectId}`)
      );

      const projectSnapshot = await getDocs(projectsQuery);

      if (projectSnapshot.empty) {
        navigate('/my-projects');
        return;
      }

      const projectDoc = projectSnapshot.docs[0];
      setProject({
        id: projectDoc.id,
        ...projectDoc.data()
      });
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!project) return;

    navigator.clipboard.writeText(project.shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!project) return;

    const text = encodeURIComponent(`Check out my project "${project.title}" and leave your honest review!\n\n${project.shareableLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (!project) return;

    const text = encodeURIComponent(`Check out my project "${project.title}" on @AnoniReview! Leave your honest feedback:`);
    const url = encodeURIComponent(project.shareableLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    if (!canvas) return;

    const svg = canvas.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${project.title.replace(/\s+/g, '-')}-qr-code.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-carbon-base">
      <Navbar showAuthButtons={false} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-mint-pulse rounded-full mb-6 animate-pulse">
            <svg className="w-12 h-12 text-carbon-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-mist mb-3">
            Your Project is Live!
          </h1>
          <p className="text-slate-mist text-opacity-70 text-lg">
            Share your link to start receiving anonymous feedback
          </p>
        </div>

        {/* Project Preview Card */}
        <div className="bg-slate-mist bg-opacity-5 rounded-2xl p-6 mb-8 border-2 border-mint-pulse">
          <div className="flex items-start space-x-4">
            {project.thumbnailURL && (
              <img
                src={project.thumbnailURL}
                alt={project.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-mist mb-2">{project.title}</h3>
              <p className="text-slate-mist text-opacity-70 text-sm line-clamp-2 mb-2">
                {project.description}
              </p>
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs text-mint-pulse border border-mint-pulse rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-slate-mist text-opacity-60">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shareable Link Section */}
        <div className="bg-carbon-base rounded-2xl p-8 mb-8 shadow-dark">
          <label className="block text-slate-mist text-opacity-80 text-sm font-semibold mb-3">
            Share this link to get reviews
          </label>
          <div className="flex items-center space-x-3 bg-slate-mist bg-opacity-10 rounded-lg p-4 mb-6">
            <code className="flex-1 text-mint-pulse font-mono text-sm break-all">
              {project.shareableLink}
            </code>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 px-4 py-2 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={shareOnWhatsApp}
              className="flex flex-col items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors space-y-2"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            <button
              onClick={shareOnTwitter}
              className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors space-y-2"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="flex flex-col items-center justify-center p-4 bg-slate-mist bg-opacity-10 hover:bg-opacity-20 text-slate-mist border-2 border-slate-mist border-opacity-20 rounded-lg transition-colors space-y-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="text-sm font-medium">QR Code</span>
            </button>

            <button
              onClick={() => navigate(`/review/${projectId}`)}
              className="flex flex-col items-center justify-center p-4 bg-slate-mist bg-opacity-10 hover:bg-opacity-20 text-slate-mist border-2 border-slate-mist border-opacity-20 rounded-lg transition-colors space-y-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium">Preview</span>
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="bg-slate-mist rounded-2xl p-8 mb-8 text-center">
            <h3 className="text-2xl font-bold text-carbon-base mb-6">QR Code</h3>
            <div id="qr-code" className="flex justify-center mb-6 bg-white p-6 rounded-lg inline-block">
              <QRCodeSVG
                value={project.shareableLink}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-carbon-base text-opacity-70 mb-4">
              Scan this QR code to visit the review page
            </p>
            <button
              onClick={downloadQR}
              className="px-6 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Download QR Code
            </button>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-slate-mist bg-opacity-5 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-mist mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-mint-pulse rounded-full flex items-center justify-center text-carbon-base text-sm font-bold">
                1
              </div>
              <p className="text-slate-mist text-opacity-80 text-sm pt-0.5">
                Share your link on social media, forums, or with friends
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-mint-pulse rounded-full flex items-center justify-center text-carbon-base text-sm font-bold">
                2
              </div>
              <p className="text-slate-mist text-opacity-80 text-sm pt-0.5">
                Wait for the community to review your project
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-mint-pulse rounded-full flex items-center justify-center text-carbon-base text-sm font-bold">
                3
              </div>
              <p className="text-slate-mist text-opacity-80 text-sm pt-0.5">
                Check back to read honest, anonymous feedback and improve your work
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate('/my-projects')}
            className="flex-1 px-6 py-3 bg-slate-mist bg-opacity-10 text-slate-mist border-2 border-slate-mist border-opacity-20 rounded-lg font-semibold hover:border-mint-pulse hover:text-mint-pulse transition-all"
          >
            View My Projects
          </button>
          <button
            onClick={() => navigate(`/review/${projectId}`)}
            className="flex-1 px-6 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:bg-opacity-90 transition-colors shadow-mint"
          >
            View Project Page
          </button>
        </div>
      </div>
    </div>
  );
}
