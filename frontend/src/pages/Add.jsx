import { useState } from 'react'

function Add() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [errors, setErrors] = useState({})
  const [showToast, setShowToast] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = 'Quantity must be above 0'
    return newErrors
  }

  const clearForm = () => {
    setName('')
    setQuantity('')
    setUnit('')
    setCategory('')
    setExpirationDate('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          unit,
          category,
          expiration_date: expirationDate || null,
        }),
      })

      if (response.ok) {
        clearForm()
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2500)
      } else {
        const data = await response.json()
        setErrors({ form: data.error || 'Something went wrong' })
      }
    } catch (err) {
      setErrors({ form: 'Could not reach the server. Is it running?' })
    }
  }

  return (
    <div className="page">
      {showToast && <div className="toast">✓ Log successful</div>}

      <h1>Add Item</h1>
      <p className="subtitle">Manually add an item to your pantry</p>

      <form onSubmit={handleSubmit} className="detect-card">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Peanut Butter"
          />
          {errors.name && <p style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            min="0"
            step="0.1"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
          />
          {errors.quantity && <p style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>{errors.quantity}</p>}
        </div>

        <div className="field">
          <label>Unit</label>
          <input
            type="text"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="jar, lb, carton..."
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
            placeholder="Pantry, Dairy, Produce..."
          />
        </div>

        <div className="field">
          <label>Expiration Date</label>
          <input
            type="date"
            className="value"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        {errors.form && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{errors.form}</p>}

        <button type="submit" className="btn-primary">Add Item</button>
      </form>
    </div>
  )
}

export default Add