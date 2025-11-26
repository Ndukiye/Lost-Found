import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ItemDetails from './pages/ItemDetails'
import ItemSubmission from './pages/ItemSubmission'
import SearchResults from './pages/SearchResults'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const { user, checkUser, loading } = useAuthStore()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/items/search" element={<SearchResults />} />
            <Route 
              path="/items/submit" 
              element={
                user ? <ItemSubmission /> : <Navigate to="/auth/login" replace />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? <UserDashboard /> : <Navigate to="/auth/login" replace />
              } 
            />
            <Route 
              path="/admin" 
              element={
                user?.user_metadata?.role === 'admin' ? 
                  <AdminDashboard /> : 
                  <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App