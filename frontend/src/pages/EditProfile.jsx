import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'

function EditProfile() {
  const { currentUser, updateUser } = useUser()
  const navigate = useNavigate()

  const [household, setHousehold] = useState(currentUser?.household || 1)
  const [diet, setDiet] = useState(currentUser?.diet || 'None')
  const [error, setError] = useState('')

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Edit Profile</h1>
        <p className="subtitle">You're not logged in yet</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await updateUser({ household, diet })
      navigate('/profile')
    } catch (err) {
      setError('Something went wrong saving your changes')
    }
  }

  return (
    <div className="page">
      <h1>Edit Profile</h1>
      <p className="subtitle">Update your household preferences</p>

      <form onSubmit={handleSubmit} className="detect-card">
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

        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  )
}

export default EditProfile