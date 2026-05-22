import DemoApp from './demo/DemoApp'
import { MuseGallery } from './muse/MuseGallery'
import { MuseOverlay } from './muse/MuseOverlay'

export default function App() {
  // Dev-only: open /?gallery to see every Muse UI state at once.
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('gallery')) {
    return <MuseGallery />
  }

  return (
    <>
      <DemoApp />
      <MuseOverlay />
    </>
  )
}
