import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'

function Profile() {
  const { currentUser, setCurrentUser } = useUser()
  const navigate = useNavigate()

  if (!currentUser) {
    return (
      <div className="page">
        <h1>My Profile</h1>
        <p className="subtitle">You're not logged in yet</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  const handleLogOut = () => {
    setCurrentUser(null)
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar-large">{currentUser.initials}</div>
        <h1>{currentUser.name}</h1>
        <p className="subtitle">{currentUser.email}</p>
      </div>

      <div className="section-label">Household Preferences</div>
      <div className="settings-list">
        <div className="settings-row">
          <span>Household Size</span>
          <span className="settings-value">{currentUser.household} people</span>
        </div>
        <div className="settings-row">
          <span>Dietary Preferences</span>
          <span className="settings-value">{currentUser.diet}</span>
        </div>
      </div>

      <div className="section-label">Account</div>
      <div className="settings-list">
        <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => navigate('/edit-profile')}>
          <span>Edit Profile</span>
          <span className="chevron">›</span>
        </div>
        <div className="settings-row" style={{ cursor: 'pointer' }} onClick={handleLogOut}>
          <span>Log Out</span>
          <span className="chevron">›</span>
        </div>
      </div>
    </div>
  )
}

export default Profile