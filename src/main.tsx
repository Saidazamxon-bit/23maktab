import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import SmoothScroll from './components/smooth-scroll/SmoothScroll'
import { LanguageProvider } from './i18n'
import { AdminAuthProvider } from './admin/auth/AdminAuthContext'
import { EditModeProvider } from './admin/EditMode'
import { SiteDataProvider } from './lib/siteData'
import { ThemeProvider } from './lib/theme'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <LanguageProvider>
            <SiteDataProvider>
              <EditModeProvider>
                <SmoothScroll />
                <App />
              </EditModeProvider>
            </SiteDataProvider>
          </LanguageProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
