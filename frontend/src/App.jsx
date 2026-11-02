import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './UserContext'
import Nav from './Nav'
import TopNav from './TopNav'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import EditProfile from './pages/EditProfile'
import Profile from './pages/Profile'
import Shopping from './pages/Shopping'
import Activity from './pages/Activity'
import Home from './pages/Home'
import Add from './pages/Add'
import Inventory from './pages/Inventory'
import ScanCamera from './pages/ScanCamera'
import './App.css'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app">
          <TopNav />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/scan" element={<ScanCamera />} />
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
    </UserProvider>
  )
}

export default App