import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Salon closes at 18:30 — appointments must end by then
const CLOSING_MIN = 18 * 60 + 30

function generateSlots(durationMin: number): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      const slotMin = h * 60 + m
      if (slotMin + durationMin <= CLOSING_MIN) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
  }
  return slots
}

export async function GET(req: NextRequest) {
  const date     = req.nextUrl.searchParams.get('date')
  const duration = Math.max(30, parseInt(req.nextUrl.searchParams.get('duration') ?? '60'))

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const allSlots = generateSlots(duration)

  const svcEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const svcKey   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const calId    = process.env.GOOGLE_CALENDAR_ID ?? 'primary'

  if (!svcEmail || !svcKey) {
    return NextResponse.json({ allSlots, busySlots: [] })
  }

  try {
    const { google } = await import('googleapis')

    const auth = new google.auth.JWT({
      email: svcEmail,
      key:   svcKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const cal = google.calendar({ version: 'v3', auth })

    const timeMin = new Date(`${date}T00:00:00-06:00`).toISOString()
    const timeMax = new Date(`${date}T23:59:59-06:00`).toISOString()

    const res = await cal.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: 'America/Mexico_City',
        items: [{ id: calId }],
      },
    })

    const busy = res.data.calendars?.[calId]?.busy ?? []

    const busySlots = allSlots.filter(slot => {
      const slotStart = new Date(`${date}T${slot}:00-06:00`)
      const slotEnd   = new Date(slotStart.getTime() + duration * 60_000)
      return busy.some(p => {
        const s = new Date(p.start!)
        const e = new Date(p.end!)
        return slotStart < e && slotEnd > s
      })
    })

    return NextResponse.json({ allSlots, busySlots })
  } catch (err) {
    console.error('[calendar/availability]', err)
    return NextResponse.json({ allSlots, busySlots: [] })
  }
}
