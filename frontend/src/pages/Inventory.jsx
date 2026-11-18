import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../UserContext'
import ItemDetailModal from '../ItemDetailModal'

function getStatus(daysLeft) {
  if (daysLeft === null) return { label: 'No Date', className: 'settings-value' }
  if (daysLeft < 0) return { label: 'Expired', className: 'expired-status' }
  if (daysLeft <= 3) return { label: 'Expiring Soon', className: 'expiring' }
  return { label: 'Fresh', className: 'fresh-status' }
}

// Items with no expiration date sort last when sorting by expiration
const daysLeftForSort = (item) => (item.days_left === null || item.days_left === undefined ? Infinity : item.days_left)

const SORTS = {
  lowest: { label: 'Lowest stock', compare: (a, b) => a.quantity - b.quantity },
  expiring: { label: 'Expiring soonest', compare: (a, b) => daysLeftForSort(a) - daysLeftForSort(b) },
  name: { label: 'Name (A–Z)', compare: (a, b) => a.name.localeCompare(b.name) },
}

function formatQuantity(item) {
  return `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`
}

function Inventory() {
  const { currentUser } = useUser()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('lowest')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  const loadItems = async () => {
    if (!currentUser) return
    try {
      const response = await fetch(`/api/items?user_id=${currentUser.id}`)
      if (!response.ok) throw new Error('Request failed')
      setItems(await response.json())
      setError('')
    } catch (err) {
      setError('Could not load your inventory. Make sure the server is running, then try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadItems()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Inventory</h1>
        <p className="subtitle">You're not logged in yet</p>
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

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort()

  const matchesFilters = (item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === 'all' || item.category === categoryFilter)

  const activeItems = items
    .filter((item) => item.status === 'active' && matchesFilters(item))
    .sort(SORTS[sortBy].compare)
  const usedItems = items.filter((item) => item.status === 'used' && matchesFilters(item))
  const thrownOutItems = items.filter((item) => item.status === 'thrown_out' && matchesFilters(item))

  const hasAnyActiveItems = items.some((item) => item.status === 'active')

  return (
    <div className="page">
      <h1>Inventory</h1>
      <p className="subtitle">Everything currently in your pantry</p>

      {loading && <div className="empty"><p>Loading your inventory…</p></div>}

      {!loading && error && (
        <div className="empty">
          <p className="field-error">{error}</p>
          <button className="btn-primary inventory-retry" onClick={() => { setLoading(true); loadItems() }}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="field">
            <input
              type="text"
              className="value form-input"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="inventory-controls">
            <label className="inventory-control">
              Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {Object.entries(SORTS).map(([key, sort]) => (
                  <option key={key} value={key}>{sort.label}</option>
                ))}
              </select>
            </label>
            <label className="inventory-control">
              Category
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="section-label">Active</div>
          {activeItems.length === 0 ? (
            <div className="empty">
              {hasAnyActiveItems ? (
                <p>No items match your search or filter.</p>
              ) : (
                <>
                  <p>Your pantry is empty.</p>
                  <Link to="/add" className="btn-manual inventory-empty-link">Add your first item</Link>
                </>
              )}
            </div>
          ) : (
            <div className="settings-list">
              {activeItems.map((item) => {
                const status = getStatus(item.days_left)
                return (
                  <div className="inventory-item-row" key={item.id} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                    <span className={`status-badge ${status.className}`}>{status.label}</span>
                    <span className="inventory-item-name">{item.name}</span>
                    <span className="inventory-item-qty">{formatQuantity(item)}</span>

                    <div className="inventory-item-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="icon-btn icon-btn-used"
                        title="Mark Used"
                        onClick={() => item.quantity > 1 ? setSelectedItem(item) : handleMark(item.id, 'used')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn icon-btn-trash"
                        title="Throw Out"
                        onClick={() => item.quantity > 1 ? setSelectedItem(item) : handleMark(item.id, 'thrown_out')}
                      >
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
        </>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={loadItems}
        />
      )}
    </div>
  )
}

export default Inventory
