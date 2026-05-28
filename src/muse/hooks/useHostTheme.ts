import { useEffect } from 'react'

/**
 * Mirrors the host app's color scheme onto the Muse UI root by writing
 * `data-theme="light" | "dark"` on the passed element. The CSS variables in
 * `muse.css` flip based on that attribute.
 *
 * Detection order:
 *   1. `html.dark` class (the de facto Tailwind dark-mode convention)
 *   2. `prefers-color-scheme: dark` media query
 *
 * Listens to both, so toggling the host's theme propagates without a refresh.
 */
export function useHostTheme(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const compute = (): 'light' | 'dark' => {
      if (document.documentElement.classList.contains('dark')) return 'dark'
      if (document.documentElement.classList.contains('light')) return 'light'
      return mql.matches ? 'dark' : 'light'
    }

    const apply = () => root.setAttribute('data-theme', compute())
    apply()

    const mo = new MutationObserver(apply)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    mql.addEventListener('change', apply)

    return () => {
      mo.disconnect()
      mql.removeEventListener('change', apply)
    }
  }, [rootRef])
}
