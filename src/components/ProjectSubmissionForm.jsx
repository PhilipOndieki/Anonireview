import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';

const TECH_STACK_OPTIONS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
  'Firebase', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap',
  'Next.js', 'Nuxt.js', 'GraphQL', 'REST API', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'MySQL', 'Redis', 'Go', 'Rust', 'C++', 'C#',
  '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Swift', 'Kotlin',
  'Flutter', 'React Native', 'Electron', 'Three.js', 'WebGL'
];

export default function ProjectSubmissionForm({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    techStack: [],
    customTech: ''
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        url: '',
        description: '',
        techStack: [],
        customTech: ''
      });
      setThumbnail(null);
      setThumbnailPreview(null);
      setErrors({});
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTechStackToggle = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : prev.techStack.length < 5
          ? [...prev.techStack, tech]
          : prev.techStack
    }));
  };

  const handleAddCustomTech = () => {
    if (formData.customTech.trim() && formData.techStack.length < 5) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, prev.customTech.trim()],
        customTech: ''
      }));
    }
  };

  const handleRemoveTech = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          thumbnail: 'File size must be less than 2MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          thumbnail: 'File must be an image (PNG, JPG, or WebP)'
        }));
        return;
      }

      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, thumbnail: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Project URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      let thumbnailURL = null;

      // Upload thumbnail if provided
      if (thumbnail) {
        const storageRef = ref(storage, `project-thumbnails/${currentUser.uid}/${nanoid()}`);
        await uploadBytes(storageRef, thumbnail);
        thumbnailURL = await getDownloadURL(storageRef);
      }

      // Generate unique shareable ID
      const shareableId = nanoid(8);

      // Create project document
      const projectData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        techStack: formData.techStack,
        thumbnailURL,
        shareableLink: `${window.location.origin}/review/${shareableId}`,
        authorUID: currentUser.uid,
        authorName: currentUser.displayName,
        authorPhoto: currentUser.photoURL,
        createdAt: serverTimestamp(),
        views: 0,
        averageRating: 0,
        totalReviews: 0,
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);

      // Update user's project count
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        projectsPosted: increment(1)
      });

      // Close modal and navigate to share page
      onClose();
      if (onSuccess) {
        onSuccess(docRef.id);
      }
      navigate(`/project/${shareableId}/share`);
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit project. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-base bg-opacity-80 backdrop-blur-sm px-4 overflow-y-auto py-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
    >
      <div className="bg-slate-mist rounded-2xl shadow-dark-lg w-full max-w-2xl p-6 md:p-8 relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-carbon-base hover:text-mint-pulse transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse rounded disabled:opacity-50"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 id="project-form-title" className="text-2xl md:text-3xl font-bold text-carbon-base mb-6">
          Post Your Project
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-carbon-base font-semibold mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="My Awesome React App"
              className={`w-full px-4 py-3 bg-carbon-base text-slate-mist border ${
                errors.title ? 'border-red-500' : 'border-slate-mist border-opacity-20'
              } rounded-lg focus:outline-none focus:border-mint-pulse focus:ring-2 focus:ring-mint-pulse transition-colors`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : 'title-helper'}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <span id="title-error" className="text-red-500 text-sm">
                  {errors.title}
                </span>
              ) : (
                <span id="title-helper" className="text-carbon-base text-opacity-60 text-sm">
                  {formData.title.length}/100 characters
                </span>
              )}
            </div>
          </div>

          {/* Project URL */}
          <div>
            <label htmlFor="url" className="block text-carbon-base font-semibold mb-2">
              Project URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://myproject.com or https://github.com/user/repo"
              className={`w-full px-4 py-3 bg-carbon-base text-slate-mist border ${
                errors.url ? 'border-red-500' : 'border-slate-mist border-opacity-20'
              } rounded-lg focus:outline-none focus:border-mint-pulse focus:ring-2 focus:ring-mint-pulse transition-colors`}
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'url-error' : 'url-helper'}
            />
            {errors.url ? (
              <span id="url-error" className="text-red-500 text-sm mt-1 block">
                {errors.url}
              </span>
            ) : (
              <span id="url-helper" className="text-carbon-base text-opacity-60 text-sm mt-1 block">
                Live demo or GitHub repository
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-carbon-base font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              rows={6}
              placeholder="Tell reviewers what your project does and what feedback you're looking for..."
              className={`w-full px-4 py-3 bg-carbon-base text-slate-mist border ${
                errors.description ? 'border-red-500' : 'border-slate-mist border-opacity-20'
              } rounded-lg focus:outline-none focus:border-mint-pulse focus:ring-2 focus:ring-mint-pulse transition-colors resize-none`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : 'description-helper'}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <span id="description-error" className="text-red-500 text-sm">
                  {errors.description}
                </span>
              ) : (
                <span id="description-helper" className="text-carbon-base text-opacity-60 text-sm">
                  {formData.description.length}/500 characters
                </span>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-carbon-base font-semibold mb-2">
              Tech Stack (Max 5)
            </label>

            {/* Selected tags */}
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-mint-pulse text-carbon-base rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:bg-carbon-base hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tech}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined options */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-40 overflow-y-auto p-2 bg-carbon-base bg-opacity-10 rounded-lg">
              {TECH_STACK_OPTIONS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTechStackToggle(tech)}
                  disabled={formData.techStack.length >= 5 && !formData.techStack.includes(tech)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.techStack.includes(tech)
                      ? 'bg-mint-pulse text-carbon-base'
                      : 'bg-carbon-base text-slate-mist border border-slate-mist border-opacity-20 hover:border-mint-pulse disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            {/* Custom tech input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.customTech}
                onChange={(e) => setFormData(prev => ({ ...prev, customTech: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTech())}
                placeholder="Add custom technology"
                disabled={formData.techStack.length >= 5}
                className="flex-1 px-4 py-2 bg-carbon-base text-slate-mist border border-slate-mist border-opacity-20 rounded-lg focus:outline-none focus:border-mint-pulse transition-colors disabled:opacity-50 text-sm"
              />
              <button
                type="button"
                onClick={handleAddCustomTech}
                disabled={!formData.customTech.trim() || formData.techStack.length >= 5}
                className="px-4 py-2 bg-mint-pulse text-carbon-base rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label htmlFor="thumbnail" className="block text-carbon-base font-semibold mb-2">
              Project Thumbnail (Optional)
            </label>

            {thumbnailPreview && (
              <div className="mb-3 relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-carbon-base bg-opacity-80 text-slate-mist rounded-full hover:bg-opacity-100 transition-colors"
                  aria-label="Remove thumbnail"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <input
              type="file"
              id="thumbnail"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-3 bg-carbon-base text-slate-mist border border-slate-mist border-opacity-20 rounded-lg focus:outline-none focus:border-mint-pulse file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mint-pulse file:text-carbon-base hover:file:bg-opacity-90"
            />
            {errors.thumbnail ? (
              <span className="text-red-500 text-sm mt-1 block">{errors.thumbnail}</span>
            ) : (
              <span className="text-carbon-base text-opacity-60 text-sm mt-1 block">
                PNG, JPG, or WebP. Max size: 2MB
              </span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-carbon-base text-carbon-base rounded-lg font-semibold hover:bg-carbon-base hover:text-slate-mist transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-mint-pulse text-carbon-base rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
