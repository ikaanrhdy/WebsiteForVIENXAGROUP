import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import WebIT from './pages/WebIT.jsx'
import ProductUnit from './pages/ProductUnit.jsx'
import Berita from './pages/Berita.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ShoppingCart from './pages/ShoppingCart.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminApp from './admin/AdminApp.jsx'
import UserApp from './admin/UserApp.jsx'

// Agar tautan seperti /#unit atau /web-it#paket tetap menggulir ke bagian yang dituju.
function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 0)
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/web-it" element={<WebIT />} />
        <Route path="/unit/:slug" element={<ProductUnit />} />
        <Route path="/berita" element={<Berita />} />
        <Route path="/keranjang" element={<ShoppingCart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={<ProtectedRoute role="super_admin"><AdminApp /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute role="user"><UserApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
