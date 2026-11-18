import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../UserContext'

const CATEGORY_SUGGESTIONS = ['Pantry', 'Dairy', 'Produce', 'Meat', 'Frozen', 'Beverages', 'Snacks', 'Other']

function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function Add() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [errors, setErrors] = useState({})
  const [showToast, setShowToast] = useState(false)
  const [scanMessage, setScanMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const barcode = searchParams.get('barcode')
    if (!barcode) return

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, user_id: currentUser?.id }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setName(result.item_name)
          setCategory(result.category || 'Pantry')
          setQuantity('1')
          setScanMessage(`✓ Recognized: ${result.item_name}. Please confirm quantity and enter the expiration date.`)
        } else {
          setScanMessage('Scan unsuccessful. Please enter the item manually.')
        }
      })
      .catch(() => setScanMessage('Scan unsuccessful. Please enter the item manually.'))
  }, [searchParams, currentUser])

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Add Item</h1>
        <p className="subtitle">You're not logged in yet</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  // Validation rules (documented for the SCRUM notes):
  //  - name: required after trimming, max 60 characters
  //  - quantity: required, a number above 0, max 9999
  //  - expiration date: optional, but cannot be in the past
  //  - unit and category: optional
  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Enter a name for the item.'
    else if (name.trim().length > 60) newErrors.name = 'Name must be 60 characters or fewer.'

    if (quantity === '') newErrors.quantity = 'Enter a quantity.'
    else if (Number.isNaN(Number(quantity)) || Number(quantity) <= 0) newErrors.quantity = 'Quantity must be above 0.'
    else if (Number(quantity) > 9999) newErrors.quantity = 'Quantity must be 9999 or less.'

    if (expirationDate && expirationDate < todayString()) {
      newErrors.expirationDate = "Expiration date can't be in the past."
    }
    return newErrors
  }

  const clearForm = () => {
    setName('')
    setQuantity('')
    setUnit('')
    setCategory('')
    setExpirationDate('')
    setScanMessage('')
  }

  // Typing in a field clears that field's error so the message doesn't linger
  const handleChange = (field, setter) => (e) => {
    setter(e.target.value)
    if (errors[field] || errors.form) {
      setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          quantity: Number(quantity),
          unit: unit.trim(),
          category: category.trim(),
          expiration_date: expirationDate || null,
          user_id: currentUser.id,
        }),
      })

      if (response.ok) {
        clearForm()
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2500)
      } else {
        const data = await response.json().catch(() => ({}))
        setErrors({ form: data.error || 'Something went wrong. Please try again.' })
      }
    } catch (err) {
      setErrors({ form: 'Could not reach the server. Is it running?' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      {showToast && <div className="toast">✓ Item added</div>}

      <h1>Add Item</h1>
      <p className="subtitle">Manually add an item to your pantry</p>

      {scanMessage && (
        <p className={scanMessage.startsWith('✓') ? 'scan-message scan-ok' : 'scan-message scan-fail'}>
          {scanMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="detect-card" noValidate>
        <div className="field">
          <label htmlFor="item-name">Name</label>
          <input
            id="item-name"
            type="text"
            className="value form-input"
            value={name}
            onChange={handleChange('name', setName)}
            placeholder="Peanut Butter"
            autoFocus
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="item-quantity">Quantity</label>
          <input
            id="item-quantity"
            type="number"
            min="0"
            step="any"
            className="value form-input"
            value={quantity}
            onChange={handleChange('quantity', setQuantity)}
            placeholder="1"
          />
          {errors.quantity && <p className="field-error">{errors.quantity}</p>}
        </div>

        <div className="field">
          <label htmlFor="item-unit">Unit</label>
          <input
            id="item-unit"
            type="text"
            className="value form-input"
            value={unit}
            onChange={handleChange('unit', setUnit)}
            placeholder="jar, lb, carton..."
          />
        </div>

        <div className="field">
          <label htmlFor="item-category">Category</label>
          <input
            id="item-category"
            type="text"
            list="category-options"
            className="value form-input"
            value={category}
            onChange={handleChange('category', setCategory)}
            placeholder="Pantry, Dairy, Produce..."
          />
          <datalist id="category-options">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="item-expiration">Expiration Date (optional)</label>
          <input
            id="item-expiration"
            type="date"
            min={todayString()}
            className="value form-input"
            value={expirationDate}
            onChange={handleChange('expirationDate', setExpirationDate)}
          />
          {errors.expirationDate && <p className="field-error">{errors.expirationDate}</p>}
        </div>

        {errors.form && <p className="form-error">{errors.form}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Item'}
        </button>
      </form>
    </div>
  )
}

export default Add