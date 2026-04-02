import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { PredictionProvider } from './context/PredictionContext'
import LoginPage from './pages/LoginPage'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'
import FileUploadPage from './pages/FileUploadPage'
import { predictionAPI } from './utils/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = localStorage.getItem('isAuthenticated') === 'true'
    setIsAuthenticated(authStatus)

    // Health check on mount
    const checkHealth = async () => {
      try {
        const health = await predictionAPI.healthCheck()
        console.log('Backend health:', health)
      } catch (error) {
        console.warn('Backend not available yet:', error)
      }
    }

    checkHealth()
    setLoading(false)

    // Listen for storage changes (when localStorage is updated in other tabs or within the app)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated') {
        const newAuthStatus = e.newValue === 'true'
        setIsAuthenticated(newAuthStatus)
        console.log('Auth status updated:', newAuthStatus)
      }
    }

    // Also listen to the custom event we'll trigger
    const handleAuthChange = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(authStatus)
      console.log('Auth status changed:', authStatus)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authChanged', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChanged', handleAuthChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">Loading...</div>
  }

  return (
    <Router>
      <PredictionProvider>
        <Routes>
          {/* Login route */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/predictor" replace /> : <LoginPage />} 
          />

          {/* Protected predictor route */}
          <Route 
            path="/predictor" 
            element={isAuthenticated ? <InputPage onLogout={handleLogout} /> : <Navigate to="/" replace />} 
          />

          {/* Alias route for analyzer to match specification */}
          <Route
            path="/analyze"
            element={isAuthenticated ? <InputPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />

          {/* Protected dashboard route */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/" replace />} 
          />

          {/* File-based upload route */}
          <Route
            path="/upload"
            element={isAuthenticated ? <FileUploadPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PredictionProvider>
    </Router>
  )
}

export default App
