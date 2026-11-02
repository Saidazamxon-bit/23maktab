export function getShiftNumberFromTime(time?: string | null): number {
  if (!time) return 1

  const [h = '0', m = '0'] = String(time).split(':')
  const minutes = Number(h) * 60 + Number(m)
  return minutes >= 13 * 60 + 15 ? 2 : 1
}

export function getShiftLabelFromTime(time?: string | null): '1-smena' | '2-smena' {
  return getShiftNumberFromTime(time) === 2 ? '2-smena' : '1-smena'
}

export function getShiftNumberFromLesson(lesson: { start?: string | null; end?: string | null; start_time?: string | null; end_time?: string | null }): number {
  const time = lesson.start || lesson.start_time
  return getShiftNumberFromTime(time)
}

export function getShiftLabelFromLesson(lesson: { start?: string | null; end?: string | null; start_time?: string | null; end_time?: string | null }): '1-smena' | '2-smena' {
  return getShiftLabelFromTime(lesson.start || lesson.start_time)
}
