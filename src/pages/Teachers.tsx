import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { TeacherCard } from '../components/TeacherCard'
import { useLanguage } from '../i18n'
import { useTeachers } from '../lib/useTeachers'

export function TeachersPage() {
  const { t } = useLanguage()
  const { list, loading } = useTeachers()
  const [activeSubject, setActiveSubject] = useState('')
  const [query, setQuery] = useState('')
  const filterRowRef = useRef<HTMLDivElement | null>(null)

  const scrollFilter = (direction: 'left' | 'right') => {
    const row = filterRowRef.current
    if (!row) return
    const amount = Math.max(row.clientWidth * 0.8, 160)
    row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Fanlar ro'yxati o'qituvchilarning o'zidan olinadi — admin yangi fan kiritsa, avtomatik chiqadi
  const subjects = useMemo(() => {
    const set = new Set<string>()
    list.forEach((x) => { if (x.subject) set.add(x.subject) })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [list])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return list.filter((x) => {
      const okSubject = !activeSubject || x.subject === activeSubject
      const okSearch = !needle || `${x.name} ${x.subject} ${x.position}`.toLowerCase().includes(needle)
      return okSubject && okSearch
    })
  }, [list, activeSubject, query])

  return (
    <>
      <PageHero eyebrow={t.teachersPage.eyebrow} title={t.teachersPage.title} subtitle={t.teachersPage.subtitle} />

      <main className="page-main">
        <section className="section compact-section">
          <div className="container">
            <div className="toolbar glass-panel">
              <div className="filter-scroll-wrap">
                <button
                  type="button"
                  className="filter-scroll-btn left"
                  aria-label="Prev subject"
                  onClick={() => scrollFilter('left')}
                >
                  <ChevronLeft size={16} />
                </button>

                <div ref={filterRowRef} className="filter-row">
                  <button
                    type="button"
                    className={`filter-chip ${activeSubject === '' ? 'active' : ''}`}
                    onClick={() => setActiveSubject('')}
                  >
                    {t.teachers.filterAll}
                  </button>
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`filter-chip ${activeSubject === s ? 'active' : ''}`}
                      onClick={() => setActiveSubject(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="filter-scroll-btn right"
                  aria-label="Next subject"
                  onClick={() => scrollFilter('right')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <label className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.teachersPage.placeholder}
                />
              </label>
            </div>

            <div className="teachers-grid teachers-grid-page">
              {filtered.map((teacher) => <TeacherCard teacher={teacher} key={teacher.id} />)}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="empty-state glass-panel">{t.teachersPage.emptyState}</div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
