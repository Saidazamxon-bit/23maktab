export type SchoolShift = 1 | 2

/** Dars 13:15 da yoki undan keyin boshlansa, 2-smenaga kiradi. */
export function shiftForTime(startTime: string | null | undefined): SchoolShift {
  if (!startTime) return 1
  const [hours, minutes] = startTime.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 1
  return hours * 60 + minutes >= 13 * 60 + 15 ? 2 : 1
}
