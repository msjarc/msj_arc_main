/**
 * The next-meeting card's shared vocabulary.
 *
 * Kept out of calendar.ts deliberately: that module imports ical-expander, and
 * anything the browser imports from it drags the whole ~200 KB parser into the
 * client bundle. Parsing only ever happens at build time, so the client script
 * imports from here instead.
 */

/** Shown when the baked schedule has nothing left. */
export const NO_EVENT_TITLE = 'No meetings on the calendar right now.'
export const NO_EVENT_DETAIL = 'Check back when the school year starts.'

/**
 * One upcoming event, with its display strings already rendered.
 *
 * Every string is formatted at build time in the club's timezone, so the
 * browser's only job is to compare `endsAt` against its own clock. It never has
 * to know where the club is or how to format a date.
 */
export interface NextMeetingCard {
  title: string
  /** Machine-readable start, for the <time> element. */
  datetime: string
  /** When this stops being the next meeting. */
  endsAt: string
  date: string
  time: string
  location: string | null
}
