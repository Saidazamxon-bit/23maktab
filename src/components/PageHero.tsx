import { ReactNode } from 'react'
import { EditableText } from '../admin/EditableText'

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  contentKeyPrefix?: string
}

export function PageHero({ eyebrow, title, subtitle, children, contentKeyPrefix = 'hero' }: PageHeroProps) {
  return (
    <section className="page-hero-shell">
      <div className="page-hero-overlay" />
      <div className="container page-hero-inner">
        <div className="page-hero-content">
          <span className="page-eyebrow">
            <EditableText contentKey={`${contentKeyPrefix}.eyebrow`} value={eyebrow} tag="span" />
          </span>
          <EditableText contentKey={`${contentKeyPrefix}.title`} value={title} tag="h1" />
          {subtitle && (
            <EditableText contentKey={`${contentKeyPrefix}.subtitle`} value={subtitle} tag="p" multiline />
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
