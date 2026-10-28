function Profile() {
  const user = {
    name: "Samantha Schneider",
    email: "samschneiderr@example.com",
  }

  return (
    <div className="page">
      <h1>My Profile</h1>
      <p className="subtitle">Your account information</p>

      <div className="detect-card">
        <div className="field">
          <label>Name</label>
          <div className="value">{user.name}</div>
        </div>
        <div className="field">
          <label>Email</label>
          <div className="value">{user.email}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile