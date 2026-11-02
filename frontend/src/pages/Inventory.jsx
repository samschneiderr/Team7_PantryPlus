import { useEffect, useState } from 'react'

function getStatus(daysLeft) {
  if (daysLeft === null) return { label: 'No expiration date', className: 'settings-value' }
  if (daysLeft < 0) return { label: 'Expired', className: 'expiring' }
  if (daysLeft <= 3) return { label: 'Expiring soon', className: 'expiring' }
  return { label: 'Fresh', className: 'fresh-status' }
}

function Inventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/items')
      .then((response) => response.json())
      .then(setItems)
  }, [])

  const filteredItems = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.quantity - b.quantity)

  return (
    <div className="page">
      <h1>Inventory</h1>
      <p className="subtitle">Everything currently in your pantry</p>

      <div className="field">
        <input
          type="text"
          className="value"
          style={{ width: '100%', border: '1px solid var(--border)', outline: 'none' }}
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty">
          <p>No items found.</p>
        </div>
      ) : (
        <div className="settings-list">
          <div className="settings-row inventory-header">
            <span>Item</span>
            <span>Status</span>
          </div>
          {filteredItems.map((item) => {
            const status = getStatus(item.days_left)
            return (
              <div className="settings-row" key={item.id}>
                <span>{item.name}</span>
                <span className={status.className}>{status.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Inventory