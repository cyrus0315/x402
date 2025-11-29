import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/Toaster'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ContentPage from './pages/ContentPage'
import CreatePage from './pages/CreatePage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern noise-overlay">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/content/:id" element={<ContentPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
      <Toaster />
    </div>
  )
}

export default App

