export interface AClass { id: number; grade: number; letter: string; name: string; lessons: number; students: number }

export interface ATeacher {
  id: number
  full_name: string
  code: string
  subject: string
  position: string
  experience: string
  bio: string
  photo: string
  photo_url: string
  show_on_site: boolean
  sort_order: number
  bound: boolean
  lessons: number
}

export interface ABell { lesson_no: number; start_time: string; end_time: string }

export interface ALesson {
  id: number
  class_id: number
  teacher_id: number | null
  weekday: number
  lesson_no: number
  subject: string
  room: string | null
  class_name: string
  teacher_name: string | null
}

export interface ANews {
  id: number
  title: string
  category: string
  content: string
  image: string
  image_url: string
  published_at: string
  is_published: boolean
}

export interface AGallery { id: number; title: string; image: string; image_url: string; sort_order: number }

export interface AStats {
  classes: number; teachers: number; bound_teachers: number; lessons: number; bells: number
  students: number; news: number; gallery: number; bot_users: number
}

export interface AActivity { id: number; admin_name: string; action: string; entity: string; details: string | null; created_at: string }

export interface BotStatus {
  bot: { id: number; username: string; first_name: string } | null
  bot_error: string | null
  webhook: { url: string; expected_url: string; connected: boolean; pending: number; last_error: string }
  users: { total: number; students: number; teachers: number; notify: number; blocked: number }
}

export interface BotUser {
  telegram_id: string; first_name: string; role: 'student' | 'teacher'; who: string
  notify: boolean; blocked: boolean; last_seen: string | null
}

export const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
