import IcalExpander from 'ical-expander'

/**
 * Public ICS feed for the club's Google Calendar.
 */
export const CALENDAR_ICS_URL = 'https://calendar.google.com/calendar/ical/msjamateurradio%40gmail.com/public/basic.ics'

/**
 * The feed publishes X-WR-TIMEZONE: America/Los_Angeles. Every timed event is
 * formatted in this zone so the build machine's own timezone never shifts a
 * meeting time.
 */
export const CALENDAR_TIME_ZONE = 'America/Los_Angeles'

const MONTHS_AHEAD = 12

export interface CalendarEvent {
  /** Unique per occurrence, since a recurring series shares one UID. */
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  location?: string
}

/** The subset of an ICAL.Time we rely on. */
interface IcalTime {
  isDate: boolean
  year: number
  month: number
  day: number
  toJSDate(): Date
}

/**
 * All-day values are floating dates with no timezone. Anchoring them to UTC
 * midnight (and formatting them as UTC) keeps them on the right day regardless
 * of where the site is built.
 */
function toDate(time: IcalTime): Date {
  return time.isDate ? new Date(Date.UTC(time.year, time.month - 1, time.day)) : time.toJSDate()
}

function toEvent(uid: string, title: string, start: IcalTime, end: IcalTime, location?: string): CalendarEvent {
  const startDate = toDate(start)

  return {
    id: `${uid}-${startDate.toISOString()}`,
    title,
    start: startDate,
    end: toDate(end),
    allDay: start.isDate,
    location: location || undefined,
  }
}

async function loadEvents(): Promise<CalendarEvent[]> {
  const response = await fetch(CALENDAR_ICS_URL)

  if (!response.ok) {
    throw new Error(
      `Could not load the club calendar (${response.status} ${response.statusText}) from ${CALENDAR_ICS_URL}`,
    )
  }

  const expander = new IcalExpander({ ics: await response.text(), maxIterations: 1000 })

  const from = new Date()
  const to = new Date(from)
  to.setMonth(to.getMonth() + MONTHS_AHEAD)

  // between() keeps anything still running, so a meeting in progress stays "next".
  const { events, occurrences } = expander.between(from, to)

  return [
    ...events.map((event) => toEvent(event.uid, event.summary, event.startDate, event.endDate, event.location)),
    ...occurrences.map((occurrence) =>
      toEvent(
        occurrence.item.uid,
        occurrence.item.summary,
        occurrence.startDate,
        occurrence.endDate,
        occurrence.item.location,
      ),
    ),
  ].sort((a, b) => a.start.getTime() - b.start.getTime())
}

let pending: Promise<CalendarEvent[]> | null = null

/**
 * Upcoming events, soonest first. The feed is fetched once per build and shared
 * by every component that asks for it.
 */
export function getUpcomingEvents(): Promise<CalendarEvent[]> {
  pending ??= loadEvents()
  return pending
}

export async function getNextEvent(): Promise<CalendarEvent | undefined> {
  const [next] = await getUpcomingEvents()
  return next
}

export function formatEventDate(event: CalendarEvent): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: event.allDay ? 'UTC' : CALENDAR_TIME_ZONE,
  }).format(event.start)
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'All day'

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CALENDAR_TIME_ZONE,
  })

  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_TIME_ZONE,
    timeZoneName: 'short',
  })
    .formatToParts(event.start)
    .find((part) => part.type === 'timeZoneName')?.value

  return `${time.format(event.start)} to ${time.format(event.end)}${zone ? ` ${zone}` : ''}`
}
