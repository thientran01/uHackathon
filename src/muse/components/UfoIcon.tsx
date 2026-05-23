import { useEffect, useRef } from 'react'

export function UfoIcon({
  size = 18,
  loading = false,
  className = '',
}: {
  size?: number
  loading?: boolean
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const eyeRef = useRef<SVGCircleElement>(null)
  const saucerRef = useRef<SVGEllipseElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const g = gRef.current
    const eye = eyeRef.current
    const saucer = saucerRef.current
    if (!svg || !g || !eye || !saucer) return

    if (!loading) {
      g.setAttribute('transform', 'translate(0, 0)')
      eye.setAttribute('cx', '12')
      eye.setAttribute('cy', '7.4')
      saucer.setAttribute('transform', '')
      svg.style.transform = ''
      return
    }

    let raf: number
    const start = performance.now()
    const tiltCycle = 1800  // ms per full tilt oscillation
    const spinInterval = 5000
    const spinDuration = 700

    const tick = (now: number) => {
      const elapsed = now - start

      // Periodic full spin — rotate the SVG element itself to avoid internal clipping
      const timeSinceLastSpin = elapsed % spinInterval
      if (timeSinceLastSpin < spinDuration) {
        const p = timeSinceLastSpin / spinDuration
        const spinEased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
        svg.style.transform = `rotate(${(spinEased * 360).toFixed(2)}deg)`
      } else {
        svg.style.transform = ''
      }

      // Single tilt value drives everything — saucer, dome roll, and eye
      const tiltT = (elapsed % tiltCycle) / tiltCycle
      const tiltSin = Math.sin(2 * Math.PI * tiltT)

      // Saucer tilts left/right
      saucer.setAttribute('transform', `rotate(${(tiltSin * 12).toFixed(2)}, 12, 13)`)

      // Dome rolls along the saucer surface: x follows the tilt direction,
      // y follows the ellipse curve so the ball settles into the dish as it rolls outward
      const domeX = tiltSin * 3.5
      const curveY = 3.5 * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(domeX / 11.5, 2))))
      g.setAttribute('transform', `translate(${domeX.toFixed(3)}, ${curveY.toFixed(3)})`)

      // Eye rolls inside the dome
      eye.setAttribute('cx', (12 + tiltSin * 1.1).toFixed(3))
      eye.setAttribute('cy', (7.4 + Math.abs(tiltSin) * 0.3).toFixed(3))

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loading])

  const h = Math.round((size * 16) / 24)
  return (
    <svg
      ref={svgRef}
      width={size}
      height={h}
      viewBox="0 0 24 16"
      fill="none"
      overflow="visible"
      aria-hidden
      className={className}
    >
      <g ref={gRef}>
        <ellipse cx="12" cy="9.5" rx="6" ry="4.2" fill="currentColor" />
        <circle ref={eyeRef} cx="12" cy="7.4" r="1.8" fill="#17171b" />
      </g>
      <ellipse ref={saucerRef} cx="12" cy="13" rx="11.5" ry="3.5" fill="currentColor" />
    </svg>
  )
}
