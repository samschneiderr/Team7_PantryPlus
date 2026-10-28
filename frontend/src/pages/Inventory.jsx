import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/items')
      .then(response => {
        if (!response.ok) throw new Error('Request failed')
        return response.json()
      })
      .then(setItems)
      .catch(() => setError('Could not load your pantry.'))
      .finally(() => setLoading(false))
  }, [])

  // lowest stock first, matching the Homepage snapshot
  const visibleItems = [...items]
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.quantity - b.quantity)

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  if (items.length === 0) {
    return (
      <div>
        <p>Your pantry is empty. Tap Scan Food to add your first item!</p>
        <Link to="/add">Scan Food</Link>
      </div>
    )
  }

  return (
    <div>
      <input
        type="search"
        placeholder="Search your pantry"
        value={search}
        onChange={event => setSearch(event.target.value)}
      />

      <div className="section-label">Inventory</div>
      <div className="settings-list">
        {visibleItems.map(item => (
          <div className="settings-row" key={item.id}>
            <span>{item.name}</span>
            <span className="settings-value">
              {item.quantity} {item.unit}
            </span>
            {item.days_left !== null && (
              <span className={item.days_left <= 3 ? 'expiring' : 'settings-value'}>
                {item.days_left} {item.days_left === 1 ? 'day' : 'days'} left
              </span>
            )}
          </div>
        ))}
        {visibleItems.length === 0 && <p>No items match "{search}".</p>}
      </div>
    </div>
  )
}

export default Inventory