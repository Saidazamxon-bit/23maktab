import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '../i18n'
import { useTheme } from '../lib/theme'

export function Navbar() {
  const { t } = useLanguage()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Har bir havola o'z sahifasiga mos nom bilan chiqadi
  const navItems = useMemo(
    () => [
      { to: '/', label: t.nav.home, aliases: ['bosh sahifa', 'home', 'главная', 'main', 'asosiy'] },
      { to: '/haqida', label: t.nav.about, aliases: ['haqida', 'about', 'о школе', 'maktab', 'school'] },
      { to: '/oqituvchilar', label: t.nav.teachers, aliases: ['oqituvchilar', 'o‘qituvchilar', 'teachers', 'учителя', 'ustoz', 'ustozlar'] },
      { to: '/darslar-jadvali', label: t.nav.schedule, aliases: ['darslar jadvali', 'dars jadvali', 'schedule', 'timetable', 'расписание', 'jadval', 'dars'] },
    ],
    [t],
  )

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return navItems.filter((item) => [item.label, ...item.aliases].join(' ').toLowerCase().includes(query))
  }, [navItems, searchQuery])

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const handleResultClick = (path: string) => {
    closeSearch()
    navigate(path)
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="23-MAKTAB">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          <span>
            <strong>23-MAKTAB</strong>
            <small>{t.brand.tagline}</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            type="button"
            aria-label={t.nav.searchLabel}
            onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false) }}
          >
            <Search size={18} />
          </button>
          <button className="icon-btn" type="button" aria-label={t.nav.themeToggle} title={t.nav.themeToggle} onClick={toggle}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LanguageSwitcher className="lang-switcher-inline" />
          <button
            className="mobile-menu-button icon-btn"
            type="button"
            aria-label={t.nav.menuToggle}
            aria-expanded={isMenuOpen}
            onClick={() => { setIsMenuOpen((prev) => !prev); setIsSearchOpen(false) }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className={`mobile-dropdown ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="container mobile-dropdown-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {isSearchOpen && (
        <div className="search-panel" aria-live="polite">
          <div className="container search-inner">
            <Search size={18} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.nav.searchPlaceholder}
            />
            <button className="search-close-btn" type="button" aria-label={t.nav.closeSearch} onClick={closeSearch}>
              <X size={16} />
            </button>
            <kbd>ESC</kbd>
          </div>

          {searchQuery.trim() && (
            <div className="container search-results">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((item) => (
                  <button key={item.to} type="button" className="search-result" onClick={() => handleResultClick(item.to)}>
                    <span className="search-result-title">{item.label}</span>
                  </button>
                ))
              ) : (
                <div className="search-empty-text">{t.nav.noSearchResults}</div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
