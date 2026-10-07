import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { adminApi, ApiError } from '../../lib/api'
import { DAYS, type ABell, type AClass, type ALesson, type ATeacher } from '../types'
import { Empty, errMsg, Field, LoadState, Modal, PageHead, useLoad, useUi } from '../ui'

interface Cell { weekday: number; lesson_no: number; lesson: ALesson | null }

export function ScheduleAdminPage() {
  const { toast, confirm } = useUi()
  const base = useLoad(async () => {
    const [c, t, b] = await Promise.all([
      adminApi.get<{ classes: AClass[] }>('classes'),
      adminApi.get<{ teachers: ATeacher[] }>('teachers'),
      adminApi.get<{ bells: ABell[] }>('bells'),
    ])
    return { classes: c.classes, teachers: t.teachers, bells: b.bells }
  })
  const [classId, setClassId] = useState(0)
  const [lessons, setLessons] = useState<ALesson[]>([])
  const [loadingL, setLoadingL] = useState(false)
  const [cell, setCell] = useState<Cell | null>(null)
  const [subject, setSubject] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [room, setRoom] = useState('')
  const [busy, setBusy] = useState(false)
  const [conflict, setConflict] = useState('')

  const classes = base.data?.classes || []
  useEffect(() => {
    if (!classId && classes.length) setClassId(classes[0].id)
  }, [classes, classId])

  const loadLessons = async (id: number) => {
    if (!id) return
    setLoadingL(true)
    try {
      setLessons((await adminApi.get<{ lessons: ALesson[] }>('lessons', { class_id: id })).lessons)
    } catch (e) { toast(errMsg(e), 'err') } finally { setLoadingL(false) }
  }
  useEffect(() => { void loadLessons(classId) }, [classId]) // eslint-disable-line react-hooks/exhaustive-deps

  const grid = useMemo(() => {
    const m = new Map<string, ALesson>()
    lessons.forEach((l) => m.set(`${l.weekday}-${l.lesson_no}`, l))
    return m
  }, [lessons])

  // Fan nomlari takliflari: jadvaldagi va o'qituvchilardagi fanlar
  const subjects = useMemo(() => {
    const s = new Set<string>()
    ;(base.data?.teachers || []).forEach((t) => t.subject && s.add(t.subject))
    lessons.forEach((l) => s.add(l.subject))
    return Array.from(s).sort()
  }, [base.data, lessons])

  const open = (weekday: number, lesson_no: number) => {
    const l = grid.get(`${weekday}-${lesson_no}`) || null
    setCell({ weekday, lesson_no, lesson: l })
    setSubject(l?.subject || '')
    setTeacherId(l?.teacher_id ? String(l.teacher_id) : '')
    setRoom(l?.room || '')
    setConflict('')
  }

  const pickTeacher = (id: string) => {
    setTeacherId(id)
    // O'qituvchining fani bo'sh maydonga avtomatik qo'yiladi
    const t = base.data?.teachers.find((x) => String(x.id) === id)
    if (t && !subject && t.subject) setSubject(t.subject)
  }

  const save = async (e: FormEvent, force = false) => {
    e.preventDefault()
    if (!cell) return
    setBusy(true)
    try {
      await adminApi.post('lessons', 'save', {
        class_id: classId, weekday: cell.weekday, lesson_no: cell.lesson_no,
        subject, teacher_id: teacherId ? Number(teacherId) : null, room, force,
      })
      toast('Saqlandi')
      setCell(null)
      await loadLessons(classId)
    } catch (err) {
      if (err instanceof ApiError && err.data.conflict) setConflict(err.message)
      else toast(errMsg(err), 'err')
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!cell?.lesson) return
    try {
      await adminApi.post('lessons', 'delete', { id: cell.lesson.id })
      toast('Dars o‘chirildi')
      setCell(null)
      await loadLessons(classId)
    } catch (err) { toast(errMsg(err), 'err') }
  }

  const clearAll = async () => {
    const name = classes.find((c) => c.id === classId)?.name
    if (!(await confirm(`${name} sinfining butun jadvali o‘chirilsinmi?`))) return
    try {
      await adminApi.post('lessons', 'clear', { class_id: classId })
      toast('Jadval tozalandi')
      await loadLessons(classId)
    } catch (err) { toast(errMsg(err), 'err') }
  }

  const bells = base.data?.bells || []

  return (
    <>
      <PageHead title="Dars jadvali" desc="Katakchani bosib dars qo‘shing yoki o‘zgartiring. O‘zgarishlar saytda va Telegram botda darrov ko‘rinadi.">
        {classId > 0 && lessons.length > 0 && (
          <button type="button" className="a-btn ghost danger" onClick={() => void clearAll()}><Trash2 size={16} /> Jadvalni tozalash</button>
        )}
      </PageHead>
      <LoadState loading={base.loading} error={base.error} onRetry={() => void base.reload()} />

      {base.data && classes.length === 0 && <Empty>Avval “Sinflar” bo‘limida sinf qo‘shing.</Empty>}
      {base.data && classes.length > 0 && bells.length === 0 && <Empty>Avval “Qo‘ng‘iroqlar” bo‘limida dars vaqtlarini kiriting.</Empty>}

      {base.data && classes.length > 0 && bells.length > 0 && (
        <>
          <div className="a-card a-row-form">
            <label className="a-field narrow">
              <span className="a-label">Sinf</span>
              <select className="a-input" value={classId} onChange={(e) => setClassId(Number(e.target.value))}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            {loadingL && <span className="a-muted">Yuklanmoqda…</span>}
          </div>

          <div className="a-card a-scroll">
            <table className="a-grid-table">
              <thead>
                <tr>
                  <th scope="col">Dars</th>
                  {DAYS.map((d) => <th scope="col" key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {bells.map((b) => (
                  <tr key={b.lesson_no}>
                    <th scope="row">
                      <b>{b.lesson_no}</b>
                      <small>{b.start_time}–{b.end_time}</small>
                    </th>
                    {DAYS.map((_, i) => {
                      const l = grid.get(`${i + 1}-${b.lesson_no}`)
                      return (
                        <td key={i}>
                          <button type="button" className={`a-cell ${l ? 'filled' : ''}`} onClick={() => open(i + 1, b.lesson_no)}
                            aria-label={`${DAYS[i]}, ${b.lesson_no}-dars${l ? `: ${l.subject}` : ': bo‘sh'}`}>
                            {l ? (
                              <>
                                <b>{l.subject}</b>
                                <small>{[l.teacher_name, l.room && `${l.room}-xona`].filter(Boolean).join(' · ')}</small>
                              </>
                            ) : <span className="a-plus">+</span>}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cell && (
        <Modal title={`${DAYS[cell.weekday - 1]}, ${cell.lesson_no}-dars`} onClose={() => setCell(null)} small>
          <form onSubmit={(e) => void save(e)} className="a-form">
            <Field label="Fan *">
              <input className="a-input" list="subject-list" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={80} autoFocus />
              <datalist id="subject-list">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="O‘qituvchi">
              <select className="a-input" value={teacherId} onChange={(e) => pickTeacher(e.target.value)}>
                <option value="">— tanlanmagan —</option>
                {(base.data?.teachers || []).map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}{t.subject ? ` (${t.subject})` : ''}</option>
                ))}
              </select>
            </Field>
            <Field label="Xona">
              <input className="a-input" value={room} onChange={(e) => setRoom(e.target.value)} maxLength={20} placeholder="204" />
            </Field>
            {conflict && (
              <div className="a-alert" role="alert">
                {conflict}
                <button type="button" className="a-btn sm" onClick={(e) => void save(e, true)} disabled={busy}>Baribir saqlash</button>
              </div>
            )}
            <div className="a-modal-actions">
              {cell.lesson && <button type="button" className="a-btn ghost danger" onClick={() => void remove()}>O‘chirish</button>}
              <span className="a-grow" />
              <button type="button" className="a-btn ghost" onClick={() => setCell(null)}>Bekor qilish</button>
              <button type="submit" className="a-btn" disabled={busy}>Saqlash</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
