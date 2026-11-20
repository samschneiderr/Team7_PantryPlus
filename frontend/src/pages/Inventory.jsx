import { useEffect, useState } from 'react'
import { useUser } from '../UserContext'
import ItemDetailModal from '../ItemDetailModal'

function getStatus(daysLeft) {
  if (daysLeft === null) return { label: 'No Date', className: 'settings-value' }
  if (daysLeft < 0) return { label: 'Expired', className: 'expired-status' }
  if (daysLeft <= 3) return { label: 'Expiring Soon', className: 'expiring' }
  return { label: 'Fresh', className: 'fresh-status' }
}

const isLowStock = (item) => item.status === 'active' && item.quantity < 2

const TABS = ['Active', 'Low Stock', 'Used', 'Thrown Out']

function Inventory() {
  const { currentUser } = useUser()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('Active')
  const [addedNames, setAddedNames] = useState([])

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

  const handleAddToShoppingList = async (itemName) => {
    await fetch('/api/shopping-list/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_name: itemName, user_id: currentUser.id }),
    })
    setAddedNames((prev) => [...prev, itemName])
  }

  const matchesSearch = (item) => item.name.toLowerCase().includes(search.toLowerCase())

  const activeItems = items.filter((item) => item.status === 'active' && matchesSearch(item))
    .sort((a, b) => a.quantity - b.quantity)
  const lowStockItems = items.filter((item) => isLowStock(item) && matchesSearch(item))
  const usedItems = items.filter((item) => item.status === 'used' && matchesSearch(item))
  const thrownOutItems = items.filter((item) => item.status === 'thrown_out' && matchesSearch(item))

  const renderActiveTab = () => (
    activeItems.length === 0 ? (
      <div className="empty"><p>No active items found.</p></div>
    ) : (
      <div className="settings-list">
        {activeItems.map((item) => {
          const status = getStatus(item.days_left)
          return (
            <div className="inventory-item-row" key={item.id} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
              <span className={`status-badge ${status.className}`}>{status.label}</span>
              <span className="inventory-item-name">{item.name}</span>

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
    )
  )

  const renderLowStockTab = () => (
    lowStockItems.length === 0 ? (
      <div className="empty"><p>Nothing is low on stock right now.</p></div>
    ) : (
      <div className="settings-list">
        {lowStockItems.map((item) => (
          <div className="settings-row" key={item.id}>
            <span>{item.name}</span>
            <span className="settings-value">{item.quantity} {item.unit} left</span>
            <button
              className="icon-btn"
              title="Add to Shopping List"
              disabled={addedNames.includes(item.name)}
              onClick={() => handleAddToShoppingList(item.name)}
            >
              {addedNames.includes(item.name) ? 'Added' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    )
  )

  const renderSimpleTab = (list, label) => (
    list.length === 0 ? (
      <div className="empty"><p>No {label.toLowerCase()} items found.</p></div>
    ) : (
      <div className="settings-list">
        {list.map((item) => (
          <div className="settings-row" key={item.id}>
            <span>{item.name}</span>
            <span className="settings-value">{label}</span>
          </div>
        ))}
      </div>
    )
  )

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

      <div className="inventory-tabbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`inventory-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Active' && renderActiveTab()}
      {activeTab === 'Low Stock' && renderLowStockTab()}
      {activeTab === 'Used' && renderSimpleTab(usedItems, 'Used')}
      {activeTab === 'Thrown Out' && renderSimpleTab(thrownOutItems, 'Thrown Out')}

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