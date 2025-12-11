# AnoniReview - Anonymous Project Reviews for Developers

AnoniReview is a community-driven platform where developers receive honest, anonymous feedback on their projects. Get unbiased reviews that help you grow and improve your skills.

![AnoniReview Platform](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&w=1200&h=400)

## Features

- **Anonymous Reviews**: Get honest feedback without bias
- **Simple Sharing**: Share your project via unique links, QR codes, or social media
- **Community Leaderboard**: Discover top-rated projects
- **Easy Authentication**: Google Sign-In only - no complex registration
- **Mobile-First Design**: Optimized for all devices
- **Real-Time Updates**: Instant notifications when reviews are posted
- **Tech Stack Tags**: Categorize projects by technologies used

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool

### Backend & Services
- **Firebase Authentication** - Google Sign-In
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - Image hosting
- **Firebase Hosting** - Static site hosting
- **Firebase Analytics** - Usage tracking

### Libraries
- **nanoid** - Unique ID generation
- **qrcode.react** - QR code generation
- **crypto-js** - Secure hashing for duplicate prevention

## Design System

### Color Palette (60-30-10 Rule)
- **Carbon Base** (#2B2D33) - 60% - Main backgrounds, navigation
- **Slate Mist** (#E8EBF0) - 30% - Text, secondary backgrounds
- **Mint Pulse** (#72F5C9) - 10% - CTAs, accents, highlights

### Typography
- **Font Family**: Inter, Poppins, DM Sans
- **Base Size**: 16px (mobile), 18px (desktop)
- **Accessibility**: WCAG 2.1 AA compliant

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account ([Create one here](https://firebase.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/anonireview.git
   cd anonireview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

   b. Enable the following services:
      - **Authentication** → Google Sign-In
      - **Firestore Database** → Start in production mode
      - **Storage** → Start in production mode
      - **Hosting** (optional for deployment)

   c. Get your Firebase configuration:
      - Go to Project Settings → General
      - Scroll to "Your apps" → Web app
      - Copy the configuration object

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Deploy Firestore security rules**

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   firebase deploy --only storage:rules
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

## Project Structure

```
anonireview/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectSubmissionForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── config/              # Configuration files
│   │   └── firebase.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── MyProjects.jsx
│   │   ├── ReviewPage.jsx
│   │   └── ShareableLinkPage.jsx
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase configuration
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firebase Security Rules

### Firestore Rules
- Users can only modify their own profile
- Anyone can read active projects
- Project owners can update/delete their projects
- Reviews are anonymous - anyone can submit
- Anti-spam: Duplicate prevention via IP hashing

### Storage Rules
- Users can upload thumbnails (max 2MB)
- Only image files allowed (PNG, JPG, WebP)
- Anyone can read uploaded images

## Deployment

### Deploy to Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Initialize Firebase Hosting** (first time only)
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set `dist` as the public directory
   - Configure as a single-page app: Yes
   - Don't overwrite index.html

3. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

Your app will be live at `https://your-project.web.app`

### Deploy to Vercel (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all `VITE_FIREBASE_*` variables

## Usage Guide

### For Project Authors

1. **Sign In** with your Google account
2. **Post a Project**:
   - Fill in title, URL, and description
   - Add tech stack tags (max 5)
   - Upload an optional thumbnail (max 2MB)
3. **Get Your Shareable Link**:
   - Copy the unique link
   - Share on WhatsApp, Twitter, or any platform
   - Download QR code for physical sharing
4. **Track Reviews**:
   - View all reviews on the project page
   - Check your dashboard for statistics

### For Reviewers

1. **Visit a Project Link** (no account needed)
2. **Rate the Project** (1-10 scale)
3. **Write Honest Feedback** (min 50 characters)
4. **Submit Anonymously** - Your identity stays private
5. **Mark Reviews as Helpful** to support quality feedback

## Performance Optimization

- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: WebP format, responsive images
- **Caching**: Service worker for offline support
- **CDN**: Firebase Hosting global CDN
- **Lighthouse Scores**:
  - Performance: >90
  - Accessibility: >95
  - Best Practices: >95
  - SEO: >90

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast ratios (4.5:1 minimum)
- Focus indicators on all interactive elements
- Semantic HTML structure

## Security Features

- **Anonymous Reviews**: No user data stored with reviews
- **IP Hashing**: Prevents duplicate reviews (SHA-256)
- **Rate Limiting**: Max 5 reviews per hour per IP
- **Content Moderation**: Flagging system for inappropriate content
- **XSS Protection**: Input sanitization
- **HTTPS Only**: Secure connections

## Roadmap

### Phase 1 (MVP) - Completed
- [x] Landing page with hero section
- [x] Google Sign-In authentication
- [x] Project submission form
- [x] Shareable link generation
- [x] Anonymous review system
- [x] Leaderboard
- [x] User dashboard

### Phase 2 (Planned)
- [ ] Email notifications for new reviews
- [ ] Verified reviewer badges
- [ ] Advanced analytics dashboard
- [ ] Project categories and filters
- [ ] Comment threads on reviews
- [ ] API for embedding reviews

### Phase 3 (Future)
- [ ] Premium features (featured placement, detailed analytics)
- [ ] Mobile app (React Native)
- [ ] Integration with GitHub/GitLab
- [ ] AI-powered review summaries

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Firebase Authentication Error
- Ensure Google Sign-In is enabled in Firebase Console
- Check that your domain is authorized in Authentication → Settings → Authorized domains

### Reviews Not Showing
- Verify Firestore indexes are deployed
- Check browser console for errors
- Ensure security rules are deployed correctly

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (should be v18+)

### Storage Upload Fails
- Verify Storage rules are deployed
- Check file size (max 2MB)
- Ensure file type is image (PNG, JPG, WebP)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspiration from modern developer platforms
- Community feedback from beta testers
- Open source libraries and tools used in this project

## Support

- Report bugs: [GitHub Issues](https://github.com/yourusername/anonireview/issues)
- Feature requests: [GitHub Discussions](https://github.com/yourusername/anonireview/discussions)
- Email: support@anonireview.com

---

**Built with ❤️ by developers, for developers**

*Positive criticism builds better developers. Get unbiased feedback that actually improves your skills.*
