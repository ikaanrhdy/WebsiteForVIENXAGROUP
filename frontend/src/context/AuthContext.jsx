import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken } from '../lib/api.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export const homeFor = (user) => (user?.role === 'super_admin' ? '/admin' : '/dashboard')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* token sudah tidak valid */ }
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!getToken()) return
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => setToken(null)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('vienxa:unauthorized', onUnauthorized)
    return () => window.removeEventListener('vienxa:unauthorized', onUnauthorized)
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    setToken(r.token)
    setUser(r.user)
    return r.user
  }

  const register = async (payload) => {
    const r = await api.post('/auth/register', payload)
    setToken(r.token)
    setUser(r.user)
    return r.user
  }

  return <AuthCtx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthCtx.Provider>
}
