import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const emptyForm = { name: '', quantity: '', unit: '', category: '', expiration_date: '' }

function Add() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function validate() {
    const found = {}
    if (!form.name.trim()) found.name = 'Name is required.'
    if (!form.quantity || Number(form.quantity) <= 0) found.quantity = 'Enter a quantity above 0.'
    return found
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
    })
      .then(response => {
        if (!response.ok) throw new Error('Request failed')
        setMessage('Item added!')
        setForm(emptyForm)
        setTimeout(() => navigate('/inventory'), 800)
      })
      .catch(() => setMessage('Something went wrong. Please try again.'))
  }

  return (
    <div>
      <Link to="/scan">Scan Food</Link>

      <form onSubmit={handleSubmit}>
        <div className="section-label">Add Manually</div>

        <label>Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        {errors.name && <p className="error">{errors.name}</p>}

        <label>Quantity
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
        </label>
        {errors.quantity && <p className="error">{errors.quantity}</p>}

        <label>Unit
          <input name="unit" value={form.unit} onChange={handleChange} />
        </label>

        <label>Category
          <input name="category" value={form.category} onChange={handleChange} />
        </label>

        <label>Expiration date
          <input name="expiration_date" type="date" value={form.expiration_date} onChange={handleChange} />
        </label>

        <button type="submit">Add Item</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}

export default Add