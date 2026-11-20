import { useEffect, useState } from 'react'
import { useUser } from '../UserContext'

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
  const { currentUser } = useUser()
  const [items, setItems] = useState([])
  const [checkedNames, setCheckedNames] = useState(loadCheckedNames)
  const [newSuggestions, setNewSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [addError, setAddError] = useState('')

  const loadList = () => {
    if (!currentUser) return Promise.resolve()
    return fetch(`/api/shopping-list?user_id=${currentUser.id}`)
      .then((response) => response.json())
      .then(setItems)
  }

  useEffect(() => {
    if (!currentUser) return
    fetch('/api/shopping-list/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id }),
    })
      .then((response) => response.json())
      .then((data) => setNewSuggestions(data.added || []))
      .catch(() => {})
      .then(loadList)
      .catch(() => setError('Could not reach the server. Is it running?'))
      .finally(() => setIsLoading(false))
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Shopping List</h1>
        <p className="subtitle">You're not logged in yet</p>
      </div>
    )
  }

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
      body: JSON.stringify({ item_name: itemName, user_id: currentUser.id }),
    })
    updateChecked(checkedNames.filter((name) => name !== itemName))
    loadList()
  }

  const handleAddManual = async (e) => {
    e.preventDefault()
    setAddError('')
    const trimmedName = newItemName.trim()
    if (!trimmedName) {
      setAddError('Enter an item name')
      return
    }
    const response = await fetch('/api/shopping-list/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_name: trimmedName, user_id: currentUser.id }),
    })
    const data = await response.json()
    if (!data.added) {
      setAddError(`"${trimmedName}" is already on your list`)
    } else {
      setNewItemName('')
    }
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

      <form className="field" onSubmit={handleAddManual} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          className="value"
          style={{ flex: 1, border: '1px solid var(--border)', outline: 'none' }}
          placeholder="Add an item..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button type="submit" className="btn-manual" style={{ whiteSpace: 'nowrap' }}>
          + Add
        </button>
      </form>
      {addError && <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '-12px', marginBottom: '16px' }}>{addError}</p>}

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
          <p>Add an item above, or low-stock items from your Inventory can be added with one tap.</p>
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