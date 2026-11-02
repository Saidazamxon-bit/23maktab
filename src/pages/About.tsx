import { Award, BookOpenCheck, HeartHandshake, Map, ShieldCheck, Sparkles } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { useLanguage } from '../i18n'
import { useSiteData } from '../lib/siteData'

const values = [
  { icon: Sparkles, titleKey: 'Bilim', descriptionKey: 'Har bir darslar jarayonida mustaqil fikrlash va chuqur bilimni rivojlantiramiz.' },
  { icon: ShieldCheck, titleKey: 'Mas’uliyat', descriptionKey: 'O‘quvchi va o‘qituvchi o‘rtasidagi munosabatda intizom, mas’uliyat va ishonch ustuvor bo‘ladi.' },
  { icon: HeartHandshake, titleKey: 'Hurmat', descriptionKey: 'Bir-biriga hurmat, jamoaviylik va o‘zaro qo‘llab-quvvatlash muhitini yaratamiz.' },
  { icon: BookOpenCheck, titleKey: 'Rivojlanish', descriptionKey: 'Har bir yoshga mos yondashuv bilan bilim, ijod va ijtimoiy ko‘nikmalarni rivojlantiramiz.' },
]

export function AboutPage() {
  const { t } = useLanguage()
  const { gallery, loading } = useSiteData()
  const showcaseCardsData = gallery !== null
    ? gallery.map((g, i) => ({ number: String(i + 1).padStart(2, '0'), title: g.title, image: g.image }))
    : (t.showcase?.cards || [])

  return (
    <>
      <PageHero
        eyebrow={t.aboutPage.eyebrow}
        title={t.aboutPage.title}
        subtitle={t.aboutPage.subtitle}
      />

      <main className="page-main">
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="container two-column-grid">
            <div>
              <span className="section-label">{t.aboutPage.label}</span>
              <h2 className="page-section-title">{t.aboutPage.introTitle}</h2>
              <p className="page-text">{t.aboutPage.intro1}</p>
              <p className="page-text">{t.aboutPage.intro2}</p>
            </div>

            <div className="glass-panel stat-panel">
              <div className="mini-metric">
                <Award size={18} />
                <div>
                  <strong>{t.aboutPage.statsLabel}</strong>
                  <span>{t.aboutPage.statsTitle}</span>
                </div>
              </div>
              <div className="mini-metric">
                <BookOpenCheck size={18} />
                <div>
                  <strong>{'Rivojlanish'}</strong>
                  <span>{t.aboutPage.statsText}</span>
                </div>
              </div>
              <div className="mini-metric">
                <Map size={18} />
                <div>
                  <strong>{'Faoliyat'}</strong>
                  <span>{'Jamoa, tadbir va loyihalar'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section compact-section">
          <div className="container">
            <span className="section-label">{t.aboutPage.valuesTitle}</span>
            <h2 className="page-section-title center">{t.aboutPage.valuesTitle}</h2>

            <div className="values-grid">
              {values.map(({ icon: Icon, titleKey, descriptionKey }) => (
                <div className="glass-card" key={titleKey}>
                  <div className="value-icon"><Icon size={18} /></div>
                  <h3>{titleKey}</h3>
                  <p>{descriptionKey}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section compact-section alt-panel">
          <div className="container feature-split">
            <div className="feature-image-wrap">
              <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80" alt={t.aboutPage.environmentLabel} />
            </div>
            <div>
              <span className="section-label">{t.aboutPage.environmentLabel}</span>
              <h2 className="page-section-title">{t.aboutPage.environmentTitle}</h2>
              <div className="bullet-list">
                {t.aboutPage.environmentItems.map((item) => (
                  <div key={item.title}><strong>{item.title}</strong><p>{item.description}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section compact-section">
          <div className="container">
            <span className="section-label">{t.aboutPage.goalLabel}</span>
            <div className="goal-box glass-panel">
              <h2>{t.aboutPage.goalTitle}</h2>
            </div>
          </div>
        </section>

        <section className="section compact-section">
          <div className="container">
            <span className="section-label">{t.aboutPage.metricsLabel}</span>
            <h2 className="page-section-title center">{t.aboutPage.metricsTitle}</h2>
            <div className="metric-grid">
              {t.aboutPage.metrics.map((item) => (
                <div className="glass-card metric-card" key={item}>
                  <span>{item}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id='showcase' className='section gallery-section'>
          <div className='container'>
            <div className='section-label'>{t.showcase?.label}</div>
            <div className='section-heading-row'>
              <h2>
                {t.showcase?.headingStart} <span>{t.showcase?.headingHighlight}</span>
              </h2>
              <p>
                {t.showcase?.description}
              </p>
            </div>

            <div className='editorial-gallery'>
              {showcaseCardsData.map((item, index) => (
                <article key={item.number + '-' + index} className={'gallery-item' + (index === 0 ? ' gallery-item-large' : '')}>
                  <img src={item.image} alt={item.title} loading='lazy' />
                </article>
              ))}
            </div>
            {!loading && showcaseCardsData.length === 0 && <div className='empty-state glass-panel'>{t.showcase?.empty}</div>}
          </div>
        </section>
      </main>
    </>
  )
}
