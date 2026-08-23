/**
 * Solar and propagation data from N0NBH's feed at https://www.hamqsl.com/solarxml.php
 *
 * The feed sends no `Access-Control-Allow-Origin` header, so a browser on msjarc.org
 * cannot fetch it directly. Two consumers use the parser below:
 *
 *  - the build, which fetches the upstream XML and bakes the result into the page
 *  - the browser, which re-fetches the same XML through the same-origin worker route
 *    `/api/solar` and refreshes the panel in place
 */

export const SOLAR_XML_URL = 'https://www.hamqsl.com/solarxml.php'
export const SOLAR_PROXY_URL = '/api/solar'

export type Condition = 'good' | 'fair' | 'poor' | 'unknown'

export interface BandCondition {
  /** Band pair as the feed names it, e.g. `80m-40m` */
  name: string
  /** `day` or `night` */
  time: string
  /** Raw text from the feed, e.g. `Fair` */
  value: string
  condition: Condition
}

export interface VhfCondition {
  /** Phenomenon as the feed names it, e.g. `E-Skip` */
  name: string
  /** Region as the feed names it, e.g. `north_america` */
  location: string
  /** Raw text from the feed, e.g. `Band Closed` */
  value: string
  open: boolean
}

export interface SolarData {
  /** Feed timestamp as an ISO 8601 string, or null if it could not be parsed */
  updated: string | null
  /** Feed timestamp exactly as sent, e.g. `23 Aug 2026 0527 GMT` */
  updatedRaw: string
  solarflux: string
  sunspots: string
  aindex: string
  kindex: string
  /** Which K index the feed is reporting; `No Report` when only the planetary value exists */
  kindexnt: string
  xray: string
  solarwind: string
  /** Interplanetary magnetic field Bz, in nT */
  magneticfield: string
  aurora: string
  /** Aurora activity normalisation factor, shown by the banner as `/n=` */
  normalization: string
  /** Lowest latitude at which aurora is visible, in degrees */
  latdegree: string
  geomagfield: string
  signalnoise: string
  muf: string
  protonflux: string
  electronflux: string
  heliumline: string
  bands: BandCondition[]
  vhf: VhfCondition[]
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const tagText = (xml: string, name: string): string => {
  const match = xml.match(new RegExp(`<${name}>(.*?)</${name}>`, 's'))
  return match ? match[1].trim() : ''
}

/**
 * Classify a band rating. The feed normally sends exactly `Good`, `Fair` or `Poor`,
 * but occasionally hedges (`Fair to Good`), so match on substrings worst-first.
 */
export const conditionOf = (value: string): Condition => {
  const text = value.toLowerCase()
  if (text.includes('poor')) return 'poor'
  if (text.includes('fair')) return 'fair'
  if (text.includes('good')) return 'good'
  return 'unknown'
}

/** The feed sends `Band Closed` when a VHF path is shut; anything else describes an opening. */
export const isVhfOpen = (value: string): boolean => !/closed/i.test(value) && value.trim() !== ''

/** Parse the feed's `23 Aug 2026 0527 GMT` timestamp into an ISO string. */
const parseUpdated = (raw: string): string | null => {
  const match = raw.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2})(\d{2})/)
  if (!match) return null

  const month = MONTHS.indexOf(match[2].toLowerCase())
  if (month < 0) return null

  return new Date(
    Date.UTC(Number(match[3]), month, Number(match[1]), Number(match[4]), Number(match[5])),
  ).toISOString()
}

export const parseSolarXml = (xml: string): SolarData => {
  const bands: BandCondition[] = []
  const bandPattern = /<band\s+name="([^"]*)"\s+time="([^"]*)"\s*>([\s\S]*?)<\/band>/g
  let bandMatch: RegExpExecArray | null
  while ((bandMatch = bandPattern.exec(xml)) !== null) {
    const value = bandMatch[3].trim()
    bands.push({ name: bandMatch[1], time: bandMatch[2], value, condition: conditionOf(value) })
  }

  const vhf: VhfCondition[] = []
  const vhfPattern = /<phenomenon\s+name="([^"]*)"\s+location="([^"]*)"\s*>([\s\S]*?)<\/phenomenon>/g
  let vhfMatch: RegExpExecArray | null
  while ((vhfMatch = vhfPattern.exec(xml)) !== null) {
    const value = vhfMatch[3].trim()
    vhf.push({ name: vhfMatch[1], location: vhfMatch[2], value, open: isVhfOpen(value) })
  }

  const updatedRaw = tagText(xml, 'updated')

  return {
    updated: parseUpdated(updatedRaw),
    updatedRaw,
    solarflux: tagText(xml, 'solarflux'),
    sunspots: tagText(xml, 'sunspots'),
    aindex: tagText(xml, 'aindex'),
    kindex: tagText(xml, 'kindex'),
    kindexnt: tagText(xml, 'kindexnt'),
    xray: tagText(xml, 'xray'),
    solarwind: tagText(xml, 'solarwind'),
    magneticfield: tagText(xml, 'magneticfield'),
    aurora: tagText(xml, 'aurora'),
    normalization: tagText(xml, 'normalization'),
    latdegree: tagText(xml, 'latdegree'),
    geomagfield: tagText(xml, 'geomagfield'),
    signalnoise: tagText(xml, 'signalnoise'),
    muf: tagText(xml, 'muf'),
    protonflux: tagText(xml, 'protonflux'),
    // The feed really does misspell this tag.
    electronflux: tagText(xml, 'electonflux'),
    heliumline: tagText(xml, 'heliumline'),
    bands,
    vhf,
  }
}

/**
 * Traffic-light thresholds for the numeric indices, so every value is colour-coded the way
 * N0NBH's banner does it rather than only the band ratings.
 *
 * These are our thresholds, not N0NBH's — the feed publishes bare numbers and their image
 * generator keeps its own rules private. They were chosen from standard propagation practice
 * and then checked against a live banner (SFI 124, SN 87, A 4, K 0, X-Ray B8.0, 304A 123.6,
 * Ptn Flx 213, Elc Flx 12700, Aurora 2 all green; SW 420.6 and Bz -0.3 both amber), which
 * every rule below reproduces. Adjust the numbers here if you disagree with a call.
 *
 * `Aur Lat` and `/n=` are deliberately left unclassified: N0NBH colours Aur Lat red at 66.5°
 * and one sample isn't enough to tell whether that tracks latitude, activity, or something
 * else, so guessing would be worse than staying neutral.
 */
const higherIsBetter =
  (good: number, fair: number) =>
  (value: number): Condition =>
    value >= good ? 'good' : value >= fair ? 'fair' : 'poor'

const lowerIsBetter =
  (good: number, fair: number) =>
  (value: number): Condition =>
    value <= good ? 'good' : value <= fair ? 'fair' : 'poor'

const NUMERIC_SCALES: Partial<Record<keyof SolarData, (value: number) => Condition>> = {
  solarflux: higherIsBetter(100, 70),
  heliumline: higherIsBetter(100, 70),
  sunspots: higherIsBetter(50, 20),
  aindex: lowerIsBetter(7, 15),
  kindex: lowerIsBetter(2, 3),
  aurora: lowerIsBetter(2, 5),
  solarwind: lowerIsBetter(400, 500),
  protonflux: lowerIsBetter(1000, 10_000),
  electronflux: lowerIsBetter(20_000, 100_000),
  // Southward (negative) Bz opens the magnetosphere to the solar wind and disturbs HF.
  magneticfield: (value) => (value >= 1 ? 'good' : value >= -2 ? 'fair' : 'poor'),
}

/** Classify one index so it can be coloured on the same scale as the band ratings. */
export const classifyIndex = (key: keyof SolarData, raw: string): Condition => {
  const value = raw.trim()
  if (value === '') return 'unknown'

  switch (key) {
    case 'xray': {
      // Flare classes: A and B are background, C is minor, M and X disrupt HF.
      const flareClass = value[0].toUpperCase()
      if ('AB'.includes(flareClass)) return 'good'
      if (flareClass === 'C') return 'fair'
      return 'MX'.includes(flareClass) ? 'poor' : 'unknown'
    }
    case 'geomagfield': {
      const field = value.toUpperCase()
      if (/STORM|ACTIVE/.test(field) && field !== 'INACTIVE') return 'poor'
      if (field.includes('UNSETTLED')) return 'fair'
      return /INACTIVE|QUIET/.test(field) ? 'good' : 'unknown'
    }
    case 'signalnoise': {
      // e.g. `S0-S1` — judge on the noisier end of the range.
      const levels = [...value.matchAll(/S(\d+)/gi)].map((match) => Number(match[1]))
      if (levels.length === 0) return 'unknown'
      const worst = Math.max(...levels)
      return worst <= 2 ? 'good' : worst <= 5 ? 'fair' : 'poor'
    }
    case 'muf':
      // The feed sends `NoRpt` when there's no measurement to report.
      return Number.isNaN(Number.parseFloat(value)) ? 'unknown' : 'good'
    default: {
      const scale = NUMERIC_SCALES[key]
      if (!scale) return 'unknown'
      const parsed = Number.parseFloat(value)
      return Number.isNaN(parsed) ? 'unknown' : scale(parsed)
    }
  }
}

/** Render the feed timestamp the way operators read it, e.g. `23 Aug 0537 UTC`. */
export const formatUpdated = (iso: string | null, fallback = ''): string => {
  if (!iso) return fallback || 'unknown'

  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  const month = MONTHS[date.getUTCMonth()]

  return `${date.getUTCDate()} ${month[0].toUpperCase()}${month.slice(1)} ${pad(date.getUTCHours())}${pad(date.getUTCMinutes())} UTC`
}

/** Human-readable age of a reading, for the line next to the timestamp. */
export const relativeAge = (iso: string, now: number = Date.now()): string => {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours} h ago`

  return `${Math.round(hours / 24)} days ago`
}

/** Fetch and parse the feed. Used at build time against the upstream, in the browser against `/api/solar`. */
export const fetchSolarData = async (url: string = SOLAR_XML_URL): Promise<SolarData> => {
  const response = await fetch(url, { headers: { accept: 'text/xml' } })
  if (!response.ok) throw new Error(`${url} responded ${response.status} ${response.statusText}`)

  const data = parseSolarXml(await response.text())

  // Guard against anything that isn't the feed. The proxy route currently redirects to
  // /contact when it isn't wired up, and following that redirect would otherwise parse
  // an HTML page into a record of empty strings and wipe the values already on screen.
  if (!data.updated || data.bands.length === 0) {
    throw new Error(`${url} did not return the N0NBH feed`)
  }

  return data
}
