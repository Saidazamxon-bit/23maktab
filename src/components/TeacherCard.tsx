import { Star, SlidersHorizontal } from 'lucide-react'
import type { PublicTeacher } from '../lib/types'
import { initials } from '../lib/format'

export function TeacherCard({ teacher }: { teacher: PublicTeacher }) {
  return (
    <article className="teacher-card glass-card">
      <div className="teacher-image-wrap">
        {teacher.photo ? (
          <img src={teacher.photo} alt={teacher.name} loading="lazy" />
        ) : (
          <div className="teacher-initials" aria-hidden="true">{initials(teacher.name)}</div>
        )}
        {teacher.subject && <span className="teacher-badge">{teacher.subject}</span>}
      </div>
      <div className="teacher-body">
        <div className="teacher-header">
          <div>
            <h3>{teacher.name}</h3>
            {teacher.position && <span>{teacher.position}</span>}
          </div>
          <div className="teacher-rating" aria-hidden="true"><Star size={14} /></div>
        </div>
        {teacher.bio && <p>{teacher.bio}</p>}
        {teacher.experience && (
          <div className="teacher-meta">
            <span><SlidersHorizontal size={14} /> {teacher.experience}</span>
          </div>
        )}
      </div>
    </article>
  )
}
