import { useEffect, useState } from 'react'
import { signIn, signUp } from '../services/auth'
import { getAccessInfoForEmail } from '../services/realtime'
import './Auth.css'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidated, setIsValidated] = useState(null)

  // Check validation status for email to decide if access key is needed
  useEffect(() => {
    let active = true
    if (!email) { setIsValidated(null); return }
    const timer = setTimeout(async () => {
      try {
        const info = await getAccessInfoForEmail(email)
        if (!active) return
        setIsValidated(!!(info && (info.validated || info.onceLogged)))
      } catch {
        if (!active) return
        setIsValidated(null)
      }
    }, 300)
    return () => { active = false; clearTimeout(timer) }
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
        try { sessionStorage.setItem('suppressDashboard', '1') } catch {}
        setError('Account created successfully! You are now signed in.')
        // After signup, user is automatically signed in
        // Clear the form
        setEmail('')
        setPassword('')
        setIsSignUp(false)
      } else {
        await signIn(email, password, isValidated ? undefined : accessKey)
        // Firebase Auth will automatically update the user state
      }
    } catch (err) {
      console.error('Auth error:', err)
      let errorMessage = err.message
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.'
        setIsSignUp(false)
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please create an account first.'
        setIsSignUp(true)
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/access-key-missing') {
        errorMessage = 'Access not provisioned. Contact admin to enable access.'
      } else if (err.code === 'auth/invalid-access-key') {
        errorMessage = 'Invalid access key. Please contact admin for the correct key.'
      } else if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase configuration error. Please check your Firebase setup.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>To-Do App</h1>
          <p>{isSignUp ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {!isSignUp && isValidated === false && (
            <div className="form-group">
              <label htmlFor="accessKey">Access Key</label>
              <input
                id="accessKey"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
                placeholder="Enter your access key"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="switch-button"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
