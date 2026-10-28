import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './Nav'
import Profile from './pages/Profile'
import Shopping from './pages/Shopping'
import Activity from './pages/Activity'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="topnav">
          <div className="brand">Pantry<span>Plus</span></div>
        </div>

        <Routes>
          <Route path="/add" element={<div className="page"><h1>Add Item</h1><p className="subtitle">Coming soon</p></div>} />
          <Route path="/inventory" element={<div className="page"><h1>Inventory</h1><p className="subtitle">Coming soon, Ti'onna's story</p></div>} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<div className="page"><h1>Home</h1><p className="subtitle">Coming soon, Chanelee's story</p></div>} />
        </Routes>

        <Nav />
      </div>
    </BrowserRouter>
  )
}

export default App