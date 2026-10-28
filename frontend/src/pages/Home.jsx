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

      <Link to="/add" className="btn-scan">Scan Food</Link>
      <Link to="/add" className="btn-manual">Add Manually</Link>

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
