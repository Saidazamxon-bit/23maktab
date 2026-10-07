import { useMemo } from 'react'
import { teachers as staticTeachers } from '../data/teachers'
import { useSiteData } from './siteData'
import type { PublicTeacher } from './types'

/** Saytdagi o'qituvchilar ro'yxati: bazadan; server ishlamasa — zaxira (statik) ro'yxat. */
export function useTeachers(): { list: PublicTeacher[]; loading: boolean; offline: boolean } {
  const { teachers, loading } = useSiteData()
  return useMemo(() => {
    if (teachers !== null) return { list: teachers, loading, offline: false }
    const fallback: PublicTeacher[] = staticTeachers.map((t, i) => ({
      id: i + 1,
      name: t.name,
      subject: t.subject,
      position: t.role,
      experience: t.experience,
      bio: t.bio,
      photo: t.image,
    }))
    return { list: loading ? [] : fallback, loading, offline: !loading }
  }, [teachers, loading])
}
