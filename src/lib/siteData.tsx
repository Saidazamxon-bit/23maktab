import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminApi, publicApi } from './api'
import type { PublicGalleryItem, PublicNews, PublicTeacher, SiteContent, SiteInfo } from './types'

interface SiteDataState {
  settings: Record<string, string>
  content: SiteContent
  /** null = serverdan olib bo'lmadi (offline), [] = server bor, lekin hozircha bo'sh */
  teachers: PublicTeacher[] | null
  news: PublicNews[] | null
  gallery: PublicGalleryItem[] | null
  loading: boolean
}

interface SiteDataCtx extends SiteDataState {
  reload: () => Promise<void>
  /** Admin tahrir rejimida matnni saqlaydi (bazaga yozadi). */
  saveText: (lang: 'uz' | 'ru' | 'en', key: string, value: string) => Promise<void>
}

const emptyContent: SiteContent = { uz: {}, ru: {}, en: {} }

const Ctx = createContext<SiteDataCtx | undefined>(undefined)

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteDataState>({
    settings: {},
    content: emptyContent,
    teachers: null,
    news: null,
    gallery: null,
    loading: true,
  })

  const reload = useCallback(async () => {
    const [site, teachers, news, gallery] = await Promise.allSettled([
      publicApi.get<SiteInfo>('site'),
      publicApi.get<{ teachers: PublicTeacher[] }>('teachers'),
      publicApi.get<{ news: PublicNews[] }>('news'),
      publicApi.get<{ gallery: PublicGalleryItem[] }>('gallery'),
    ])
    setState((prev) => ({
      settings: site.status === 'fulfilled' ? site.value.settings || {} : prev.settings,
      content: site.status === 'fulfilled' ? { ...emptyContent, ...(site.value.content || {}) } : prev.content,
      teachers: teachers.status === 'fulfilled' ? teachers.value.teachers : prev.teachers,
      news: news.status === 'fulfilled' ? news.value.news : prev.news,
      gallery: gallery.status === 'fulfilled' ? gallery.value.gallery : prev.gallery,
      loading: false,
    }))
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveText = useCallback(async (lang: 'uz' | 'ru' | 'en', key: string, value: string) => {
    await adminApi.post('content', 'save', { lang, key, value })
    setState((prev) => {
      const map = { ...prev.content[lang] }
      if (value.trim() === '') delete map[key]
      else map[key] = value
      return { ...prev, content: { ...prev.content, [lang]: map } }
    })
  }, [])

  const value = useMemo(() => ({ ...state, reload, saveText }), [state, reload, saveText])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSiteData(): SiteDataCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSiteData must be used within SiteDataProvider')
  return v
}
