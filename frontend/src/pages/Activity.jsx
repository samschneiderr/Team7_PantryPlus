import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'

function describeActivity(entry) {
  switch (entry.action_type) {
    case 'added':
      return { icon: '➕', text: `Added ${entry.item_name}` }
    case 'used':
      return { icon: '✓', text: `Marked ${entry.item_name} as used` }
    case 'thrown_out':
      return { icon: '🗑', text: `Threw out ${entry.item_name}` }
    case 'scan_success':
      return { icon: '📷', text: `Scanned and recognized ${entry.item_name}` }
    case 'scan_failed':
      return { icon: '📷', text: `Scan unsuccessful (barcode ${entry.item_name})` }
    default:
      return { icon: '•', text: entry.item_name || 'Activity' }
  }
}

function formatTimestamp(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Activity() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [activity, setActivity] = useState([])

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/activity?user_id=${currentUser.id}`)
      .then((response) => response.json())
      .then(setActivity)
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Activity</h1>
        <p className="subtitle">You're not logged in yet</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Activity</h1>
      <p className="subtitle">Recent pantry actions</p>

      {activity.length === 0 ? (
        <div className="empty">
          <p>No activity yet.</p>
          <p>Add or scan an item to see it show up here.</p>
        </div>
      ) : (
        <div className="settings-list">
          {activity.map((entry, index) => {
            const { icon, text } = describeActivity(entry)
            return (
              <div className="settings-row" key={index}>
                <span>{icon} {text}</span>
                <span className="settings-value">{formatTimestamp(entry.timestamp)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Activity