import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'

function EditProfile() {
  const { currentUser, updateUser } = useUser()
  const navigate = useNavigate()

  const [household, setHousehold] = useState(currentUser?.household || 1)
  const [diet, setDiet] = useState(currentUser?.diet || 'None')

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

  const handleSubmit = (e) => {
    e.preventDefault()
    updateUser({ household: Number(household), diet })
    navigate('/profile')
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

        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  )
}

export default EditProfile