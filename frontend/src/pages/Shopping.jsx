import { useEffect, useState } from 'react'

// The backend has no "checked" state, so checked-off items are remembered in this browser.
const CHECKED_STORAGE_KEY = 'pantryplus-shopping-checked'

function loadCheckedNames() {
  try {
    return JSON.parse(localStorage.getItem(CHECKED_STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveCheckedNames(names) {
  try {
    localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(names))
  } catch {
    // Storage can be unavailable (e.g. private browsing); checking off still works for this visit.
  }
}

function Shopping() {
  const [items, setItems] = useState([])
  const [checkedNames, setCheckedNames] = useState(loadCheckedNames)
  const [newSuggestions, setNewSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadList = () =>
    fetch('/api/shopping-list')
      .then((response) => response.json())
      .then(setItems)

  useEffect(() => {
    // Add frequently wasted foods first (waste_suggestions.py), then show the full list.
    fetch('/api/shopping-list/suggestions', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => setNewSuggestions(data.added || []))
      .catch(() => {})
      .then(loadList)
      .catch(() => setError('Could not reach the server. Is it running?'))
      .finally(() => setIsLoading(false))
  }, [])

  const updateChecked = (names) => {
    setCheckedNames(names)
    saveCheckedNames(names)
  }

  const toggleChecked = (itemName) => {
    updateChecked(
      checkedNames.includes(itemName)
        ? checkedNames.filter((name) => name !== itemName)
        : [...checkedNames, itemName]
    )
  }

  const handleRemove = async (itemName) => {
    await fetch('/api/shopping-list/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_name: itemName }),
    })
    updateChecked(checkedNames.filter((name) => name !== itemName))
    loadList()
  }

  const toBuy = items.filter((item) => !checkedNames.includes(item.item_name))
  const checkedOff = items.filter((item) => checkedNames.includes(item.item_name))

  const renderRow = (item) => {
    const isChecked = checkedNames.includes(item.item_name)
    return (
      <div className={`shopping-item-row${isChecked ? ' checked' : ''}`} key={item.item_name}>
        <label className="shopping-item-check">
          <input type="checkbox" checked={isChecked} onChange={() => toggleChecked(item.item_name)} />
          <span className="shopping-item-name">{item.item_name}</span>
        </label>
        {item.is_waste_suggestion && (
          <span className="status-badge waste-suggestion-badge" title="You often throw this out. Consider buying less.">
            Often Wasted
          </span>
        )}
        <button className="icon-btn icon-btn-trash" title="Remove" onClick={() => handleRemove(item.item_name)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Shopping List</h1>
      <p className="subtitle">What you need to pick up next trip</p>

      {newSuggestions.length > 0 && (
        <div className="suggestion-note">
          Added {newSuggestions.join(', ')} because you've thrown {newSuggestions.length === 1 ? 'it' : 'them'} out
          several times. Consider buying a smaller amount.
        </div>
      )}

      {error && <p style={{ color: '#c0392b', fontSize: '13px' }}>{error}</p>}

      {isLoading ? null : items.length === 0 ? (
        <div className="empty">
          <p>Your shopping list is empty.</p>
          <p>Low-stock items from your Inventory can be added with one tap.</p>
        </div>
      ) : (
        <>
          <div className="section-label">To Buy</div>
          {toBuy.length === 0 ? (
            <div className="empty"><p>Everything is checked off.</p></div>
          ) : (
            <div className="settings-list">{toBuy.map(renderRow)}</div>
          )}

          {checkedOff.length > 0 && (
            <>
              <div className="section-label">Checked Off</div>
              <div className="settings-list">{checkedOff.map(renderRow)}</div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Shopping
