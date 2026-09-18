import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SLOT_DURATION = 30
const CLOSING_MIN   = 18 * 60 + 30

function generateDaySlots(): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      const slotMin = h * 60 + m
      if (slotMin + SLOT_DURATION <= CLOSING_MIN)
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  return slots
}

export async function GET(req: NextRequest) {
  const year  = parseInt(req.nextUrl.searchParams.get('year')  ?? '0')
  const month = parseInt(req.nextUrl.searchParams.get('month') ?? '0') // 1-indexed

  if (!year || !month) return NextResponse.json({ busyDays: [] })

  const svcEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const svcKey   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const calId    = process.env.GOOGLE_CALENDAR_ID ?? 'primary'

  if (!svcEmail || !svcKey) return NextResponse.json({ busyDays: [] })

  try {
    const { google } = await import('googleapis')
    const normalizedKey = svcKey.includes('\\n') ? svcKey.replace(/\\n/g, '\n') : svcKey
    const auth = new google.auth.JWT({
      email:  svcEmail,
      key:    normalizedKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })
    const cal = google.calendar({ version: 'v3', auth })

    const monthStr = month.toString().padStart(2, '0')
    const lastDay  = new Date(year, month, 0).getDate() // month is 1-indexed → gives last day

    const res = await cal.freebusy.query({
      requestBody: {
        timeMin:  `${year}-${monthStr}-01T00:00:00-06:00`,
        timeMax:  `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}T23:59:59-06:00`,
        timeZone: 'America/Mexico_City',
        items:    [{ id: calId }],
      },
    })

    const busy     = res.data.calendars?.[calId]?.busy ?? []
    const today    = new Date(); today.setHours(0, 0, 0, 0)
    const daySlots = generateDaySlots()
    const busyDays: string[] = []

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month - 1, d)
      date.setHours(0, 0, 0, 0)
      if (date < today || date.getDay() === 0) continue

      const dateStr = `${year}-${monthStr}-${d.toString().padStart(2, '0')}`

      const hasAvailableSlot = daySlots.some(slot => {
        const slotStart = new Date(`${dateStr}T${slot}:00-06:00`)
        const slotEnd   = new Date(slotStart.getTime() + SLOT_DURATION * 60_000)
        return !busy.some(p => {
          const s = new Date(p.start!)
          const e = new Date(p.end!)
          return slotStart < e && slotEnd > s
        })
      })

      if (!hasAvailableSlot) busyDays.push(dateStr)
    }

    return NextResponse.json({ busyDays })
  } catch (err) {
    console.error('[calendar/busy-days]', err)
    return NextResponse.json({ busyDays: [] })
  }
}
