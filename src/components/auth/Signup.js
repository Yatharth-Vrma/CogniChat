import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Silk from '../ui/Silk'
import './Auth.css'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, {
      full_name: fullName
    })
    
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
      setTimeout(() => navigate('/login'), 3000)
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
      
      {/* Signup Content */}
      <div className="silk-auth-content">
        <div className="silk-auth-card transparent compact">
          <div className="silk-auth-header">
            <h1 className="silk-auth-title">Join CogniChat</h1>
            <p className="silk-auth-subtitle">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="silk-auth-form">
            {error && (
              <div className="silk-auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="silk-auth-success">
                {message}
              </div>
            )}

            <div className="silk-auth-field">
              <label htmlFor="fullName" className="silk-auth-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="silk-auth-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="silk-auth-field">
              <label htmlFor="email" className="silk-auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="silk-auth-field">
              <label htmlFor="confirmPassword" className="silk-auth-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="silk-auth-input"
                placeholder="Confirm your password"
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
                'Create Account'
              )}
            </button>
          </form>

          <div className="silk-auth-footer">
            <p className="silk-auth-link-text">
              Already have an account?{' '}
              <Link to="/login" className="silk-auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup