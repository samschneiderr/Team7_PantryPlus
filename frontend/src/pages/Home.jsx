import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('/api/items')
      .then(response => response.json())
      .then(setItems)
  }, [])

  const expiringSoon = items.filter(item => item.days_left !== null && item.days_left <= 3)
  const snapshot = [...items].sort((a, b) => a.quantity - b.quantity).slice(0, 5)

  return (
    <div className="page">
      <h1>Home</h1>
      <p className="subtitle">What's in your pantry today</p>

    <div className="scan-actions">
      <Link to="/add" className="btn-scan">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        Scan Food
      </Link>
      <Link to="/add" className="btn-manual">
        + Add Manually
      </Link>
    </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>Your pantry is empty.</p>
          <p>Tap <strong>Scan Food</strong> above to add your first item.</p>
        </div>
      ) : (
        <>
          <div className="section-label">Expiring Soon</div>
          <div className="settings-list">
            {expiringSoon.map(item => (
              <div className="settings-row" key={item.id}>
                <span>{item.name}</span>
                <span className="expiring">{item.days_left} {item.days_left === 1 ? "day" : "days"} left</span>
              </div>
            ))}
          </div>

          <div className="section-label">Inventory Snapshot</div>
          <div className="settings-list">
            {snapshot.map(item => (
              <div className="settings-row" key={item.id}>
                <span>{item.name}</span>
                <span className="settings-value">{item.quantity} left</span>
              </div>
            ))}
          </div>
          <Link to="/inventory" className="see-all">See all inventory ›</Link>
        </>
      )}
    </div>
  )
}

export default Home
