/**
 * Zustand store for auth state (user + token).
 */
import { create } from 'zustand'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  organization: string | null
  organization_name: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),

  get isAuthenticated() {
    return !!get().token
  },

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))
