// Backend javoblari turlari

export interface PublicTeacher {
  id: number
  name: string
  subject: string
  position: string
  experience: string
  bio: string
  photo: string
}

export interface PublicNews {
  id: number
  title: string
  category: string
  content: string
  image: string
  date: string
}

export interface PublicGalleryItem {
  id: number
  title: string
  image: string
}

export interface PublicClass {
  id: number
  grade: number
  letter: string
  name: string
}

export interface Bell {
  lesson_no: number
  start_time: string
  end_time: string
}

export interface PublicLesson {
  weekday: number
  lesson_no: number
  subject: string
  room: string
  teacher: string
  start: string
  end: string
}

export type SiteContent = Record<'uz' | 'ru' | 'en', Record<string, string>>

export interface SiteInfo {
  settings: Record<string, string>
  content: SiteContent
}
