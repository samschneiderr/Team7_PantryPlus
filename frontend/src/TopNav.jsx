import { Link } from 'react-router-dom'
import { useUser } from './UserContext'

function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function TopNav() {
  const { currentUser } = useUser()

  return (
    <div className="topnav">
      <div className="brand">Pantry<span>Plus</span></div>
      <Link to="/profile" className="topnav-profile">
        {currentUser ? getInitials(currentUser.name) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        )}
      </Link>
    </div>
  )
}

export default TopNav