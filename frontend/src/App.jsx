import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Nav from './Nav'
import Profile from './pages/Profile'
import Shopping from './pages/Shopping'
import Activity from './pages/Activity'
import Home from './pages/Home'
import Add from './pages/Add'
import Inventory from './pages/Inventory'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="topnav">
          <Link to="/" className="brand">Pantry<span>Plus</span></Link>
        </div>

        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Home />} />
        </Routes>

        <Nav />
      </div>
    </BrowserRouter>
  )
}

export default App
