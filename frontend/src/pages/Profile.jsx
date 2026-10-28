function Profile() {
  const user = {
    name: "Samantha Schneider",
    email: "samschneiderr@example.com",
    initials: "SS",
    memberSince: "September 2026",
  }

  const household = {
    size: 3,
    dietaryPreferences: "Vegetarian",
  }

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar-large">{user.initials}</div>
        <h1>{user.name}</h1>
        <p className="subtitle">{user.email}</p>
        <p className="member-since">Member since {user.memberSince}</p>
      </div>

      <div className="section-label">Household Preferences</div>
      <div className="settings-list">
        <div className="settings-row">
          <span>Household Size</span>
          <span className="settings-value">{household.size} people</span>
        </div>
        <div className="settings-row">
          <span>Dietary Preferences</span>
          <span className="settings-value">{household.dietaryPreferences}</span>
        </div>
      </div>

      <div className="section-label">Notifications</div>
      <div className="settings-list">
        <div className="settings-row">
          <span>Expiration Alerts</span>
          <span className="settings-value">3 days before</span>
        </div>
        <div className="settings-row">
          <span>Email Notifications</span>
          <span className="settings-value">On</span>
        </div>
      </div>

      <div className="section-label">Account</div>
      <div className="settings-list">
        <div className="settings-row">
          <span>Edit Profile</span>
          <span className="chevron">›</span>
        </div>
        <div className="settings-row">
          <span>Log Out</span>
          <span className="chevron">›</span>
        </div>
      </div>
    </div>
  )
}

export default Profile