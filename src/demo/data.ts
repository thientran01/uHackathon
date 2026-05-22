export interface Player {
  id: string
  name: string
  handle: string
  elo: number
  w: number
  l: number
  streak: number
  pic: string
  club: string
  isMe?: boolean
}

export interface Match {
  id: string
  when: string
  format: string
  side: string
  teamA: string[]
  teamB: string[]
  score: string
  result: string
  eloDelta: number[]
  court: string
  tag: string
}

export interface FeedItem {
  id: string
  when: string
  who: string
  kind: string
  body: string
}

export interface ScheduleItem {
  id: string
  day: string
  date: string
  time: string
  title: string
  loc: string
  tag: string
  recurring: boolean
  rsvp: string[]
  cap: number
  weather: { hi: number; lo: number; cond: string; icon: string }
}

export interface Gear {
  brand: string
  model: string
  [key: string]: string | number
}

export interface EquipmentKit {
  paddle: Gear
  shoes: Gear
  balls: Gear
}

export const PLAYERS: Player[] = [
  { id: 'p01', name: 'Riley Park',    handle: 'riley',  elo: 1842, w: 38, l: 12, streak: 7,  pic: '🟢', club: 'A' },
  { id: 'p02', name: 'Maya Okafor',   handle: 'mayaO',  elo: 1798, w: 31, l: 14, streak: 4,  pic: '🟡', club: 'A' },
  { id: 'p03', name: 'Jordan Lee',    handle: 'jlee',   elo: 1771, w: 29, l: 16, streak: 0,  pic: '🟠', club: 'B' },
  { id: 'p04', name: 'Sam Reyes',     handle: 'samr',   elo: 1744, w: 27, l: 18, streak: 2,  pic: '🟣', club: 'B' },
  { id: 'p05', name: 'Devon Carter',  handle: 'devc',   elo: 1722, w: 24, l: 17, streak: 3,  pic: '🔵', club: 'A' },
  { id: 'p06', name: 'Priya Shah',    handle: 'priya',  elo: 1701, w: 22, l: 19, streak: 1,  pic: '🟤', club: 'C' },
  { id: 'p07', name: 'Theo Nakamura', handle: 'theon',  elo: 1688, w: 21, l: 20, streak: -2, pic: '⚪', club: 'B' },
  { id: 'p08', name: 'Alex Bauer',    handle: 'abauer', elo: 1664, w: 19, l: 22, streak: 0,  pic: '🟥', club: 'C' },
  { id: 'p09', name: 'Nina Volkov',   handle: 'nina',   elo: 1640, w: 17, l: 23, streak: 1,  pic: '🟦', club: 'A' },
  { id: 'p10', name: 'Cam Whitfield', handle: 'camw',   elo: 1612, w: 14, l: 24, streak: -1, pic: '🟨', club: 'C' },
  { id: 'p11', name: 'Rosa Delgado',  handle: 'rosad',  elo: 1588, w: 12, l: 23, streak: 0,  pic: '🟩', club: 'B' },
  { id: 'p12', name: 'You',           handle: 'you',    elo: 1565, w: 10, l: 14, streak: 2,  pic: '⭐', club: 'A', isMe: true },
]

export const MATCHES: Match[] = [
  { id: 'm01', when: '2h ago',     format: 'doubles', side: 'A',
    teamA: ['p01','p06'], teamB: ['p03','p10'], score: '11-7, 11-9',       result: 'A',
    eloDelta: [+12,+9,-12,-9],    court: 'Court 3', tag: 'organized' },
  { id: 'm02', when: '5h ago',     format: 'singles', side: 'A',
    teamA: ['p12'],       teamB: ['p07'],       score: '11-9, 9-11, 11-6', result: 'A',
    eloDelta: [+18,-18],          court: 'Court 1', tag: 'drop-in' },
  { id: 'm03', when: 'Yesterday',  format: 'doubles', side: 'B',
    teamA: ['p02','p09'], teamB: ['p04','p05'], score: '11-6, 11-8',       result: 'B',
    eloDelta: [-7,-7,+7,+7],      court: 'Court 2', tag: 'organized' },
  { id: 'm04', when: 'Yesterday',  format: 'singles', side: 'A',
    teamA: ['p01'],       teamB: ['p04'],       score: '11-5, 11-7',       result: 'A',
    eloDelta: [+11,-11],          court: 'Court 4', tag: 'drop-in' },
  { id: 'm05', when: '2 days ago', format: 'doubles', side: 'A',
    teamA: ['p08','p11'], teamB: ['p06','p07'], score: '11-9, 7-11, 12-10', result: 'A',
    eloDelta: [+14,+14,-14,-14],  court: 'Court 3', tag: 'organized' },
  { id: 'm06', when: '3 days ago', format: 'singles', side: 'A',
    teamA: ['p03'],       teamB: ['p12'],       score: '11-4, 11-9',       result: 'A',
    eloDelta: [+9,-9],            court: 'Court 1', tag: 'drop-in' },
]

export const FEED: FeedItem[] = [
  { id: 'f1', when: '12m', who: 'p01', kind: 'streak', body: 'is on a 7-match heater 🔥' },
  { id: 'f2', when: '1h',  who: 'p12', kind: 'match',  body: 'logged a 3-set thriller vs Theo' },
  { id: 'f3', when: '3h',  who: 'p06', kind: 'gear',   body: 'switched to a CRBN-1X Power Series' },
  { id: 'f4', when: '6h',  who: 'p02', kind: 'rsvp',   body: 'is in for Saturday morning' },
  { id: 'f5', when: '1d',  who: 'p09', kind: 'join',   body: 'joined the club. Say hi 👋' },
]

export const SCHEDULE: ScheduleItem[] = [
  { id: 's1', day: 'Tue', date: 'May 26', time: '6:30–8:30 PM',
    title: 'Tuesday Drop-in',      loc: 'Highland Park · Courts 1–4',
    tag: 'drop-in',  recurring: true,
    rsvp: ['p01','p02','p05','p06','p09','p12'], cap: 16,
    weather: { hi: 74, lo: 58, cond: 'Clear',     icon: '☀' } },
  { id: 's2', day: 'Thu', date: 'May 28', time: '7:00–9:00 PM',
    title: 'Thursday Ladder',      loc: 'Lincoln Rec Center · Indoor',
    tag: 'organized', recurring: true,
    rsvp: ['p01','p03','p04','p07','p08','p10','p12'], cap: 12,
    weather: { hi: 71, lo: 55, cond: 'Indoor',    icon: '🏠' } },
  { id: 's3', day: 'Sat', date: 'May 30', time: '9:00–11:30 AM',
    title: 'Saturday Round Robin', loc: 'Brookside Courts · Courts 5–8',
    tag: 'organized', recurring: true,
    rsvp: ['p01','p02','p03','p04','p05','p06','p07','p09','p11','p12'], cap: 20,
    weather: { hi: 78, lo: 61, cond: 'Sunny',     icon: '☀' } },
  { id: 's4', day: 'Sun', date: 'May 31', time: '4:00–6:00 PM',
    title: 'Sunday Singles',       loc: 'Highland Park · Court 2',
    tag: 'drop-in',  recurring: true,
    rsvp: ['p03','p12'], cap: 8,
    weather: { hi: 80, lo: 63, cond: 'P. Cloudy', icon: '⛅' } },
]

export const EQUIPMENT: Record<string, EquipmentKit> = {
  p12: {
    paddle: { brand: 'Selkirk',  model: 'Vanguard Power Air',        weight: '8.0 oz', grip: '4 1/4"',  since: 'Mar 2026' },
    shoes:  { brand: 'K-Swiss',  model: 'Express Light Pickleball',  size: 'M 10.5',                    since: 'Jan 2026' },
    balls:  { brand: 'Franklin', model: 'X-40 Outdoor',              color: 'Optic Yellow',              qty: 12 },
  },
}

export const byId = (id: string): Player | undefined => PLAYERS.find(p => p.id === id)
