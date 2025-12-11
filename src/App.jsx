import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ReviewPage from './pages/ReviewPage'
import Leaderboard from './pages/Leaderboard'
import MyProjects from './pages/MyProjects'
import ShareableLinkPage from './pages/ShareableLinkPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/review/:projectId" element={<ReviewPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId/share"
            element={
              <ProtectedRoute>
                <ShareableLinkPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
