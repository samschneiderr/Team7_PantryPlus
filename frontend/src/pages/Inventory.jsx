import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'

function getStatus(daysLeft) {
  if (daysLeft === null) return { label: 'No Date', className: 'settings-value' }
  if (daysLeft < 0) return { label: 'Expired', className: 'expired-status' }
  if (daysLeft <= 3) return { label: 'Expiring Soon', className: 'expiring' }
  return { label: 'Fresh', className: 'fresh-status' }
}

function Inventory() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  const loadItems = () => {
    if (!currentUser) return
    fetch(`/api/items?user_id=${currentUser.id}`)
      .then((response) => response.json())
      .then(setItems)
  }

  useEffect(() => {
    loadItems()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Inventory</h1>
        <p className="subtitle">You're not logged in yet</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  const handleMark = async (itemId, status) => {
    await fetch(`/api/items/${itemId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user_id: currentUser.id }),
    })
    loadItems()
  }

  const matchesSearch = (item) => item.name.toLowerCase().includes(search.toLowerCase())

  const activeItems = items.filter((item) => item.status === 'active' && matchesSearch(item))
    .sort((a, b) => a.quantity - b.quantity)
  const usedItems = items.filter((item) => item.status === 'used' && matchesSearch(item))
  const thrownOutItems = items.filter((item) => item.status === 'thrown_out' && matchesSearch(item))

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

      <div className="section-label">Active</div>
      {activeItems.length === 0 ? (
        <div className="empty"><p>No active items found.</p></div>
      ) : (
        <div className="settings-list">
          {activeItems.map((item) => {
            const status = getStatus(item.days_left)
            return (
              <div className="inventory-item-row" key={item.id}>
                <span className={`status-badge ${status.className}`}>{status.label}</span>
                <span className="inventory-item-name">{item.name}</span>

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