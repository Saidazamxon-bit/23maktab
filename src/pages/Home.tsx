import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import schoolHero from '../image/maktab.jpg'
import { EditableText } from '../admin/EditableText'
import { TeacherCard } from '../components/TeacherCard'
import { useLanguage } from '../i18n'
import { formatDate } from '../lib/format'
import { useSiteData } from '../lib/siteData'
import { useTeachers } from '../lib/useTeachers'

export function HomePage() {
  const { t, language } = useLanguage()
  const { settings, news, gallery, loading } = useSiteData()
  const { list: teacherList } = useTeachers()

  const featureList = t.features || []
  const educationCardsData = t.education?.cards || []
  // Galereya va yangiliklar bazadan; server ishlamasa — zaxira (tarjima fayllaridagi) ma'lumot
  const showcaseCardsData = gallery !== null
    ? gallery.map((g, i) => ({ number: String(i + 1).padStart(2, '0'), title: g.title, image: g.image }))
    : (t.showcase?.cards || [])
  const newsItemsData = news !== null
    ? news.slice(0, 5).map((n) => ({ id: String(n.id), category: n.category, title: n.title, date: formatDate(n.date, language), image: n.image }))
    : (t.news?.list || [])

  const iconsMap: Record<string, React.ReactNode> = {
    schedule: <CalendarDays size={18} />,
    materials: <BookOpenCheck size={18} />,
    olympiads: <GraduationCap size={18} />,
    exams: <Users size={18} />,
  }

  const heroBg = settings.hero_image || schoolHero

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-image" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="hero-overlay" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} /> <EditableText contentKey="hero.brand" value={t.brand.name} tag="span" />
            </div>
            <h1>
              <EditableText contentKey="hero.titleStart" value={t.hero.titleStart} tag="span" />
              <span>
                <EditableText contentKey="hero.titleHighlight" value={t.hero.titleHighlight} tag="span" />
              </span>
              {' '}
              <EditableText contentKey="hero.titleEnd" value={t.hero.titleEnd} tag="span" />
            </h1>
            <EditableText contentKey="hero.description" value={t.hero.description} tag="p" multiline />
            <div className="hero-actions">
              <Link to="/haqida" className="primary-btn">
                <EditableText contentKey="hero.btnAbout" value={t.hero.btnAbout} tag="span" /> <ArrowRight size={18} />
              </Link>
              <a href="#about" className="ghost-btn">
                <Play size={16} fill="currentColor" /> <EditableText contentKey="hero.btnNews" value={t.hero.btnNews} tag="span" />
              </a>
            </div>
            <div className="mini-proof">
              <div className="avatars">
                <span>DK</span>
                <span>JA</span>
                <span>MR</span>
                <span>+8</span>
              </div>
              <div>
                <strong>{t.hero.studentsCount}</strong>
                <small>{t.hero.studentsLabel}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <div className="container feature-row">
          {featureList.map((item) => (
            <div className="feature-item" key={item.title}>
              <div className="feature-mark"><Sparkles size={14} /></div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section about-section">
        <div className="container">
          <div className="section-label">{t.about.label}</div>
          <div className="section-heading-row">
            <h2>
              {t.about.headingStart} <span>{t.about.headingHighlight}</span> {t.about.headingEnd}
            </h2>
            <p>
              {t.about.description}
            </p>
          </div>

          <div className="about-grid">
            <div className="about-media">
              <img src={schoolHero} alt={t.about.photoAlt} />
            </div>
            <div className="about-copy">
              <h2>
                {t.brand.name} — <span>{t.brand.tagline}</span>
              </h2>
              <p>
                {t.aboutPage.intro1}
              </p>
              <div className="about-stats">
                <div className="stat-card">
                  <strong>{t.stats.studentsValue}</strong>
                  <span>{t.stats.studentsLabel}</span>
                </div>
                <div className="stat-card">
                  <strong>{t.stats.teachersValue}</strong>
                  <span>{t.stats.teachersLabel}</span>
                </div>
                <div className="stat-card">
                  <strong>{t.stats.classesValue}</strong>
                  <span>{t.stats.classesLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="school-location-panel">
            <div className="school-location-map">
              <iframe
                title="23-maktab manzili"
                src="https://www.google.com/maps?q=Q87H%2BXCG%2C%20Andijon%2C%20Andijon%20Viloyati%2C%20O%27zbekiston&z=15&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="school-location-info">
              <div className="section-label">Maktab manzili</div>
              <h3>Q87H+XCG, Andijon, Andijon Viloyati, Oʻzbekiston</h3>
              <p>40.7649505855598, 72.32857237844057</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=40.7649505855598,72.32857237844057"
                target="_blank"
                rel="noreferrer"
              >
                Xaritada ochish
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="education" className="section education-section">
        <div className="container">
          <div className="section-label light">{t.education.label}</div>
          <div className="section-heading-row">
            <h2>
              {t.education.headingStart} <span>{t.education.headingHighlight}</span> {t.education.headingEnd}
            </h2>
            <p>
              {t.education.description}
            </p>
          </div>

          <div className="education-grid">
            {educationCardsData.map((card) => (
              <article className="info-card" key={card.id}>
                <div className="info-icon">{iconsMap[card.id]}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <span className="card-arrow"><ChevronRight size={16} /></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="showcase" className="section gallery-section">
        <div className="container">
          <div className="section-label">{t.showcase?.label}</div>
          <div className="section-heading-row">
            <h2>
              {t.showcase?.headingStart} <span>{t.showcase?.headingHighlight}</span>
            </h2>
            <p>
              {t.showcase?.description}
            </p>
          </div>

          <div className="editorial-gallery">
            {showcaseCardsData.map((item, index) => (
              <article key={`${item.number}-${index}`} className={`gallery-item ${index === 0 ? 'gallery-item-large' : ''}`}>
                <img src={item.image} alt={item.title} loading="lazy" />
              </article>
            ))}
          </div>
          {!loading && showcaseCardsData.length === 0 && <div className="empty-state glass-panel">{t.showcase?.empty}</div>}
        </div>
      </section>

      <section id="teachers" className="section teachers-section">
        <div className="container">
          <div className="section-label">{t.teachers.label}</div>
          <div className="section-heading-row">
            <h2>
              {t.teachers.headingStart} <span>{t.teachers.headingHighlight}</span>
            </h2>
            <Link to="/oqituvchilar" className="text-btn">
              {t.teachers.viewAll} <ArrowRight size={15} />
            </Link>
          </div>

          <div className="teachers-grid">
            {teacherList.slice(0, 3).map((teacher) => <TeacherCard teacher={teacher} key={teacher.id} />)}
          </div>
        </div>
      </section>

      <section id="news" className="section news-section">
        <div className="container">
          <div className="section-label">{t.news.label}</div>
          <div className="section-heading-row">
            <h2>
              {t.news.headingStart} <span>{t.news.headingHighlight}</span>
            </h2>
            <Link to="/haqida" className="text-btn">
              {t.news.viewAll} <ArrowRight size={15} />
            </Link>
          </div>

          {!loading && newsItemsData.length === 0 && <div className="empty-state glass-panel">{t.news.empty}</div>}
          <div className="news-layout">
            {newsItemsData.map((item, index) => (
              <article key={item.id} className={`news-article ${index === 0 ? 'featured' : 'compact'}`}>
                {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
                <div className="news-body">
                  <span className="news-category">{item.category}</span>
                  <small>{item.date}</small>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
