import { useState } from 'react'
import { useUser } from './UserContext'

function ItemDetailModal({ item, onClose, onUpdated }) {
  const { currentUser } = useUser()

  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category || '')
  const [expirationDate, setExpirationDate] = useState(item.expiration_date || '')
  const [amount, setAmount] = useState(item.quantity)
  const [editError, setEditError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSaveEdit = async () => {
    setEditError('')
    const response = await fetch(`/api/items/${item.id}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        name,
        category,
        expiration_date: expirationDate || null,
      }),
    })
    if (response.ok) {
      setSaved(true)
      onUpdated()
      setTimeout(() => setSaved(false), 2000)
    } else {
      setEditError('Could not save changes.')
    }
  }

  const handleMark = async (status) => {
    setActionError('')
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setActionError('Enter an amount above 0')
      return
    }
    const response = await fetch(`/api/items/${item.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        status,
        amount: numericAmount,
      }),
    })
    if (response.ok) {
      onUpdated()
      onClose()
    } else {
      setActionError('Something went wrong.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Item Details</div>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              className="value"
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <input
              type="text"
              className="value"
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Expiration Date</label>
            <input
              type="date"
              className="value"
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          {editError && <p style={{ color: '#c0392b', fontSize: '12px', marginTop: '10px' }}>{editError}</p>}
          <button className="btn-manual" style={{ marginTop: '14px' }} onClick={handleSaveEdit}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="modal-section modal-section-action">
          <div className="modal-section-title">Use or Throw Out</div>
          <p className="subtitle" style={{ marginBottom: '10px' }}>
            Currently have {item.quantity} {item.unit}
          </p>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="value"
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {actionError && <p style={{ color: '#c0392b', fontSize: '12px', marginTop: '10px' }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button className="btn-primary" onClick={() => handleMark('used')}>Mark Used</button>
            <button className="btn-primary" style={{ background: '#c0392b' }} onClick={() => handleMark('thrown_out')}>
              Throw Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailModal