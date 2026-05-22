import React from 'react'

interface IconProps {
  size?: number
  stroke?: number
  fill?: string
  className?: string
  d?: React.ReactNode
}

function Icon({ d, size = 18, stroke = 1.75, fill = 'none', className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round"
         className={className}>
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  )
}

export const IconHome     = (p: IconProps) => <Icon {...p} d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
export const IconTrophy   = (p: IconProps) => <Icon {...p} d={<><path d="M7 4h10v3a5 5 0 0 1-10 0z" /><path d="M5 6H3v2a3 3 0 0 0 3 3" /><path d="M19 6h2v2a3 3 0 0 1-3 3" /><path d="M9 14h6v3H9zM8 20h8" /></>} />
export const IconCalendar = (p: IconProps) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>} />
export const IconSwords   = (p: IconProps) => <Icon {...p} d={<><path d="M14 4h6v6l-9 9-3-3 9-9z" /><path d="M10 4H4v6l9 9 3-3" /></>} />
export const IconBag      = (p: IconProps) => <Icon {...p} d={<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>} />
export const IconFire     = (p: IconProps) => <Icon {...p} d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0-2-1-3-1-4 1 0 2 0 3 0z" />
export const IconPlus     = (p: IconProps) => <Icon {...p} d="M12 5v14M5 12h14" />
export const IconArrowR   = (p: IconProps) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />
export const IconCheck    = (p: IconProps) => <Icon {...p} d="M5 12.5 10 17l9-10" />
export const IconPin      = (p: IconProps) => <Icon {...p} d={<><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>} />
export const IconClock    = (p: IconProps) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />
export const IconSparkle  = (p: IconProps) => <Icon {...p} d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
export const IconLogout   = (p: IconProps) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>} />

interface PballProps {
  size?: number
  hole?: string
  body?: string
  spin?: boolean
}

export function Pball({ size = 22, hole = '#0f1f1a', body = 'currentColor', spin = false }: PballProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}
         className={spin ? 'animate-[ballspin_8s_linear_infinite]' : ''}>
      <circle cx="16" cy="16" r="15" fill={body} />
      {([[10,8],[18,7],[22,12],[8,14],[14,13],[20,17],[10,20],[16,22],[22,22],[14,19],[8,19],[20,9],[14,8],[12,11],[18,12]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.4" fill={hole} opacity={0.85} />
      ))}
    </svg>
  )
}
