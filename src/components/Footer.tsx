import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useSiteData } from '../lib/siteData'

export function Footer() {
  const { t } = useLanguage()
  const { settings } = useSiteData()

  const navLinks = [
    { label: t.nav.home, to: '/' },
    { label: t.nav.about, to: '/haqida' },
    { label: t.nav.teachers, to: '/oqituvchilar' },
    { label: t.nav.schedule, to: '/darslar-jadvali' },
  ]

  // Aloqa ma'lumotlari admin paneldagi "Sozlamalar"dan olinadi
  const phone = settings.phone || t.contact.phone
  const email = settings.email || t.contact.email
  const address = settings.address || t.contact.address
  const botUser = (settings.bot_username || '').replace(/^@/, '')
  const telegramUrl = settings.telegram || (botUser ? `https://t.me/${botUser}` : '')
  const instagramUrl = settings.instagram || 'https://www.instagram.com/andijon_shahar_23maktab_rasmiy'

  const socials = [
    { key: 'instagram', url: instagramUrl, icon: <Instagram size={16} />, label: 'Instagram' },
    { key: 'facebook', url: settings.facebook, icon: <Facebook size={16} />, label: 'Facebook' },
    { key: 'youtube', url: settings.youtube, icon: <Youtube size={16} />, label: 'YouTube' },
    { key: 'telegram', url: telegramUrl, icon: <Send size={16} />, label: 'Telegram' },
  ].filter((s) => s.url)

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-branding">
          <div className="brand-stack-footer">
            <div className="brand-mark-footer">23</div>
            <div>
              <strong>{t.brand.name}</strong>
              <small>{t.brand.tagline}</small>
            </div>
          </div>
          <p>{t.meta.description}</p>
        </div>

        <div className="footer-col">
          <b>{t.footer.siteCol}</b>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </div>

        <div className="footer-col">
          <b>{t.footer.contactCol}</b>
          <span><Phone size={14} /> {phone}</span>
          <span><Mail size={14} /> {email}</span>
          <span><MapPin size={14} /> {address}</span>
        </div>

        <div className="footer-col">
          <b>{t.footer.socialCol}</b>
          <div className="social-row">
            {socials.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer noopener" aria-label={s.label} title={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
          {telegramUrl && (
            <a className="footer-bot-link" href={telegramUrl} target="_blank" rel="noreferrer noopener">
              <Send size={14} /> Telegram bot
            </a>
          )}
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{t.footer.copyright}</span>
      </div>
    </footer>
  )
}
