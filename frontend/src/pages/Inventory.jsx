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
  const [editingMinId, setEditingMinId] = useState(null)
  const [minDraft, setMinDraft] = useState('')
  const [minError, setMinError] = useState('')
  const [toast, setToast] = useState('')

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

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const startEditingMin = (item) => {
    setEditingMinId(item.id)
    setMinDraft(item.min_quantity ?? '')
    setMinError('')
  }

  // A blank value clears the minimum, so the item stops being tracked for low stock.
  const saveMin = async (itemId) => {
    if (minDraft !== '' && Number(minDraft) < 0) {
      setMinError('Minimum must be 0 or more')
      return
    }
    const response = await fetch(`/api/items/${itemId}/min-quantity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        min_quantity: minDraft === '' ? null : Number(minDraft),
        user_id: currentUser.id,
      }),
    })
    if (!response.ok) {
      const data = await response.json()
      setMinError(data.error || 'Could not save minimum')
      return
    }
    setEditingMinId(null)
    loadItems()
  }

  const handleAddToShoppingList = async (item) => {
    const response = await fetch(`/api/items/${item.id}/add-to-shopping-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id }),
    })
    const data = await response.json()
    if (!response.ok) {
      showToast(data.error || 'Could not add to shopping list')
    } else if (data.already_existed) {
      showToast(`${item.name} is already on your shopping list`)
    } else {
      showToast(`✓ Added ${item.name} to your shopping list`)
    }
  }

  const formatQuantity = (item) => `${item.quantity} ${item.unit || ''}`.trim()

  const matchesSearch = (item) => item.name.toLowerCase().includes(search.toLowerCase())

  const activeItems = items.filter((item) => item.status === 'active' && matchesSearch(item))
    .sort((a, b) => a.quantity - b.quantity)
  const usedItems = items.filter((item) => item.status === 'used' && matchesSearch(item))
  const thrownOutItems = items.filter((item) => item.status === 'thrown_out' && matchesSearch(item))

  return (
    <div className="page">
      {toast && <div className="toast">{toast}</div>}

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
              <div className={`inventory-item-row${item.is_low_stock ? ' low-stock' : ''}`} key={item.id}>
                <span className={`status-badge ${status.className}`}>{status.label}</span>
                <div className="inventory-item-details">
                  <span className="inventory-item-name">
                    {item.name}
                    {item.is_low_stock && <span className="status-badge low-stock-badge">Low Stock</span>}
                  </span>
                  {editingMinId === item.id ? (
                    <div className="min-quantity-edit">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="None"
                        value={minDraft}
                        onChange={(e) => setMinDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveMin(item.id)}
                        autoFocus
                      />
                      <button className="min-quantity-link" onClick={() => saveMin(item.id)}>Save</button>
                      <button className="min-quantity-link" onClick={() => setEditingMinId(null)}>Cancel</button>
                      {minError && <span className="min-quantity-error">{minError}</span>}
                    </div>
                  ) : (
                    <span className="inventory-item-meta">
                      {formatQuantity(item)} ·{' '}
                      <button className="min-quantity-link" onClick={() => startEditingMin(item)}>
                        {item.min_quantity === null ? 'Set minimum' : `Min ${item.min_quantity}`}
                      </button>
                    </span>
                  )}
                </div>

                <div className="inventory-item-actions">
                  {item.is_low_stock && (
                    <button className="icon-btn icon-btn-cart" title="Add to Shopping List" onClick={() => handleAddToShoppingList(item)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                      </svg>
                    </button>
                  )}
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