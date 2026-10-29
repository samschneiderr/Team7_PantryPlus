import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  const signUp = async ({ name, email, password, household, diet }) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, household: Number(household), diet }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Sign up failed')
    }

    const newUser = await response.json()
    setCurrentUser(newUser)
    return newUser
  }

  const logIn = async ({ email, password }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Login failed')
    }

    const user = await response.json()
    setCurrentUser(user)
    return user
  }

  const updateUser = async ({ household, diet }) => {
    const response = await fetch(`/api/users/${currentUser.id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ household: Number(household), diet }),
    })

    if (!response.ok) {
      throw new Error('Update failed')
    }

    const updated = { ...currentUser, household: Number(household), diet }
    setCurrentUser(updated)
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, signUp, logIn, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}