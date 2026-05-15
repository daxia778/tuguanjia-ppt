import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CreatePage from './pages/CreatePage'

export default function App() {
  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="grid-overlay" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </>
  )
}
