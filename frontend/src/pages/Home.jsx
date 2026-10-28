import { Link } from 'react-router-dom'

const items = [
  { name: "Milk", quantity: 1, daysLeft: 2 },
  { name: "Eggs", quantity: 6, daysLeft: 10 },
  { name: "Spinach", quantity: 2, daysLeft: 1 },
  { name: "Rice", quantity: 3, daysLeft: 180 },
  { name: "Yogurt", quantity: 4, daysLeft: 3 },
  { name: "Pasta", quantity: 5, daysLeft: 365 },
]

function Home() {
  const expiringSoon = items.filter(item => item.daysLeft <= 3)
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
              <div className="settings-row" key={item.name}>
                <span>{item.name}</span>
                <span className="expiring">{item.daysLeft} {item.daysLeft === 1 ? "day" : "days"} left</span>
              </div>
            ))}
          </div>

          <div className="section-label">Inventory Snapshot</div>
          <div className="settings-list">
            {snapshot.map(item => (
              <div className="settings-row" key={item.name}>
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
