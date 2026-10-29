import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

const initialUsers = [
  { id: 1, name: "Samantha Schneider", email: "samschneiderr@example.com", initials: "SS", household: 3, diet: "Vegetarian" },
  { id: 2, name: "Ti'onna Hunter", email: "tihunter@example.com", initials: "TH", household: 2, diet: "None" },
  { id: 3, name: "Chanelee Florentino", email: "cflorentino@example.com", initials: "CF", household: 4, diet: "Gluten-Free" },
]

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserProvider({ children }) {
  const [users, setUsers] = useState(initialUsers)
  const [currentUser, setCurrentUser] = useState(null)

  const signUp = ({ name, email, household, diet }) => {
    const newUser = {
      id: users.length + 1,
      name,
      email,
      initials: getInitials(name),
      household: Number(household) || 1,
      diet: diet || "None",
    }
    setUsers([...users, newUser])
    setCurrentUser(newUser)
    return newUser
  }

  const updateUser = (updatedFields) => {
    const updated = { ...currentUser, ...updatedFields }
    setCurrentUser(updated)
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, signUp, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}