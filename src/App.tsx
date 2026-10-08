import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/Home'
import { AboutPage } from './pages/About'
import { TeachersPage } from './pages/Teachers'
import { SchedulePage } from './pages/Schedule'
// edit bar removed to disable on-page text editing
import { AdminShell } from './admin/AdminLayout'
import { AdminLoginPage } from './admin/pages/LoginPage'
import { DashboardPage } from './admin/pages/DashboardPage'
import { TeachersAdminPage } from './admin/pages/TeachersPage'
import { ClassesPage } from './admin/pages/ClassesPage'
import { ScheduleAdminPage } from './admin/pages/ScheduleAdminPage'
import { BellsPage } from './admin/pages/BellsPage'
import { BotPage } from './admin/pages/BotPage'
import { NewsAdminPage } from './admin/pages/NewsAdminPage'
import { GalleryAdminPage } from './admin/pages/GalleryAdminPage'
import { SettingsAdminPage } from './admin/pages/SettingsAdminPage'
import { ActivityPage } from './admin/pages/ActivityPage'

// Ochiq sahifalar uchun umumiy maket
const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="app-shell">
    <Navbar />
    {children}
    <Footer />
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/haqida" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/oqituvchilar" element={<PublicLayout><TeachersPage /></PublicLayout>} />
      <Route path="/darslar-jadvali" element={<PublicLayout><SchedulePage /></PublicLayout>} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="teachers" element={<TeachersAdminPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="schedule" element={<ScheduleAdminPage />} />
        <Route path="bells" element={<BellsPage />} />
        <Route path="bot" element={<BotPage />} />
        <Route path="news" element={<NewsAdminPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="settings" element={<SettingsAdminPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
