import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function getStatus(daysLeft) {
  if (daysLeft === null) return { label: 'No Date', className: 'settings-value' }
  if (daysLeft < 0) return { label: 'Expired', className: 'expired-status' }
  if (daysLeft <= 3) return { label: 'Expiring Soon', className: 'expiring' }
  return { label: 'Fresh', className: 'fresh-status' }
}

// Each sort option returns a compare function for the Active list.
// Items with no expiration date (days_left === null) always go last.
const SORTS = {
  quantity: (a, b) => a.quantity - b.quantity,
  name: (a, b) => a.name.localeCompare(b.name),
  days_left: (a, b) => {
    if (a.days_left === null && b.days_left === null) return 0
    if (a.days_left === null) return 1
    if (b.days_left === null) return -1
    return a.days_left - b.days_left
  },
}

function Inventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('quantity')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadItems = () => {
    return fetch('/api/items')
      .then((response) => {
        if (!response.ok) throw new Error('Request failed')
        return response.json()
      })
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch(() => {
        setError("We couldn't load your pantry. Check your connection and try again.")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleRetry = () => {
    setLoading(true)
    loadItems()
  }

  const handleMark = async (itemId, status) => {
    await fetch(`/api/items/${itemId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadItems()
  }

  // Category dropdown options come from the data, so new categories show up automatically.
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort()

  const matchesFilters = (item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'all' || item.category === category)

  const activeItems = items
    .filter((item) => item.status === 'active' && matchesFilters(item))
    .sort(SORTS[sortBy])
  const usedItems = items.filter((item) => item.status === 'used' && matchesFilters(item))
  const thrownOutItems = items.filter((item) => item.status === 'thrown_out' && matchesFilters(item))

  if (loading) {
    return (
      <div className="page">
        <h1>Inventory</h1>
        <p className="subtitle">Everything currently in your pantry</p>
        <div className="empty"><p>Loading your pantry...</p></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h1>Inventory</h1>
        <p className="subtitle">Everything currently in your pantry</p>
        <div className="empty">
          <p>{error}</p>
          <button className="btn-manual inventory-retry" onClick={handleRetry}>Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Inventory</h1>
      <p className="subtitle">Everything currently in your pantry</p>

      {items.length > 0 && (
        <>
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

          <div className="inventory-controls">
            <label className="inventory-control">
              <span>Sort by</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="quantity">Lowest stock</option>
                <option value="name">Name (A to Z)</option>
                <option value="days_left">Expiring soonest</option>
              </select>
            </label>

            <label className="inventory-control">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}

      <div className="section-label">Active</div>
      {activeItems.length === 0 ? (
        <div className="empty">
          {items.length === 0 ? (
            <>
              <p>Your pantry is empty.</p>
              <Link to="/add" className="btn-manual inventory-empty-link">Add your first item</Link>
            </>
          ) : (
            <p>No active items match your search or filter.</p>
          )}
        </div>
      ) : (
        <div className="settings-list">
          {activeItems.map((item) => {
            const status = getStatus(item.days_left)
            return (
              <div className="inventory-item-row" key={item.id}>
                <span className={`status-badge ${status.className}`}>{status.label}</span>
                <span className="inventory-item-name">{item.name}</span>
                <span className="inventory-item-qty">{item.quantity} {item.unit}</span>

                <div className="inventory-item-actions">
                  <button className="icon-btn icon-btn-used" title="Mark Used" onClick={() => handleMark(item.id, 'used')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button className="icon-btn icon-btn-trash" title="Throw Out" onClick={() => handleMark(item.id, 'thrown_out')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {usedItems.length > 0 && (
        <>
          <div className="section-label">Used</div>
          <div className="settings-list">
            {usedItems.map((item) => (
              <div className="settings-row" key={item.id}>
                <span>{item.name}</span>
                <span className="settings-value">Used</span>
              </div>
            ))}
          </div>
        </>
      )}

      {thrownOutItems.length > 0 && (
        <>
          <div className="section-label">Thrown Out</div>
          <div className="settings-list">
            {thrownOutItems.map((item) => (
              <div className="settings-row" key={item.id}>
                <span>{item.name}</span>
                <span className="settings-value">Thrown Out</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Inventory
