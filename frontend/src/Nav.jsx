import { NavLink } from 'react-router-dom'

function Nav() {
  return (
    <div className="tabbar">
      <NavLink to="/add" className={({ isActive }) => isActive ? "tab active" : "tab"}>
        <div className="tabicon"></div>Add
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => isActive ? "tab active" : "tab"}>
        <div className="tabicon"></div>Inventory
      </NavLink>
      <NavLink to="/shopping" className={({ isActive }) => isActive ? "tab active" : "tab"}>
        <div className="tabicon"></div>Shopping
      </NavLink>
      <NavLink to="/activity" className={({ isActive }) => isActive ? "tab active" : "tab"}>
        <div className="tabicon"></div>Activity
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "tab active" : "tab"}>
        <div className="tabicon"></div>Profile
      </NavLink>
    </div>
  )
}

export default Nav