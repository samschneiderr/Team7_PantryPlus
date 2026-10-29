import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../UserContext'

function SignUp() {
  const { signUp } = useUser()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [household, setHousehold] = useState('1')
  const [diet, setDiet] = useState('None')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields')
      return
    }

    try {
      await signUp({ name, email, password, household, diet })
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Create Account</h1>
      <p className="subtitle">Set up your PantryPlus profile</p>

      <form onSubmit={handleSubmit} className="detect-card">
        <div className="field">
          <label>Full Name</label>
          <input
            type="text"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
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
        <div className="field">
          <label>Household Size</label>
          <input
            type="number"
            min="1"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={household}
            onChange={(e) => setHousehold(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Dietary Preferences</label>
          <select
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          >
            <option>None</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
            <option>Gluten-Free</option>
            <option>Dairy-Free</option>
          </select>
        </div>

        {error && (
          <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
        )}

        <button type="submit" className="btn-primary">Create Account</button>
      </form>

      <p className="subtitle" style={{ marginTop: '16px' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default SignUp