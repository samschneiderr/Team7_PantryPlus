import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../UserContext'

function Login() {
  const { logIn } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      await logIn({ email, password })
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Log In</h1>
      <p className="subtitle">Sign in to your PantryPlus account</p>

      <form onSubmit={handleSubmit} className="detect-card">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
        )}

        <button type="submit" className="btn-primary">Log In</button>
      </form>

      <p className="subtitle" style={{ marginTop: '16px' }}>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  )
}

export default Login