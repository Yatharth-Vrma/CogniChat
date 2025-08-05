import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Silk from '../ui/Silk'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState(() => {
    // Auto-load saved email
    return localStorage.getItem('cognichat-email') || ''
  })
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Auto-save email when typing
  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    localStorage.setItem('cognichat-email', value)
  }
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="silk-auth-container">
      {/* Silk Background */}
      <div className="silk-background">
        <Silk
          speed={3}
          scale={1.5}
          color="#313235ff"
          noiseIntensity={1.2}
          rotation={0.1}
        />
      </div>
      
      {/* Login Content */}
      <div className="silk-auth-content">
        <div className="silk-auth-card transparent">
          <div className="silk-auth-header">
            <h1 className="silk-auth-title">Welcome Back</h1>
            <p className="silk-auth-subtitle">Sign in to your CogniChat account</p>
          </div>

          <form onSubmit={handleSubmit} className="silk-auth-form">
            {error && (
              <div className="silk-auth-error">
                {error}
              </div>
            )}

            <div className="silk-auth-field">
              <label htmlFor="email" className="silk-auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="silk-auth-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="silk-auth-field">
              <label htmlFor="password" className="silk-auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="silk-auth-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="silk-auth-button"
            >
              {loading ? (
                <div className="silk-loading-spinner"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="silk-auth-footer">
            <p className="silk-auth-link-text">
              Don't have an account?{' '}
              <Link to="/signup" className="silk-auth-link">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login