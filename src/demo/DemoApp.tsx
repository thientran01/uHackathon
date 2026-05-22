// ============================================================
//  DEMO APP  —  this is YOUR piece
// ------------------------------------------------------------
//  This is the sample landing page that Muse edits live during
//  the demo. It is completely self-contained — you never need to
//  touch any Muse code.
//
//  RULES (so Muse can actually edit what you build):
//   1. Tailwind utility classes ONLY, written inline in className
//      as plain strings. NO .css files, NO styled-components,
//      NO style={{ }} objects, NO clsx / class variables.
//   2. One section = one component file inside src/demo/.
//   3. Export a single <DemoApp /> from this file (compose the
//      sections here).
//   4. Do NOT edit anything outside src/demo/. Don't install
//      packages or touch vite.config / package.json / App.tsx.
//
//  Run it:  npm run dev   →  open the localhost URL in your browser.
//
//  Replace everything below with the real landing page:
//   Nav · Hero · Logo strip · Features (3 cards) · Pricing (3 tiers)
//   · CTA band · Footer.  Make it look like a real Series-A startup.
// ============================================================

export default function DemoApp() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Replace me with the landing page
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Build the nav, hero, features, pricing, CTA, and footer here —
          Tailwind classes inline only.
        </p>
        <button className="mt-10 rounded-lg bg-slate-900 px-6 py-3 font-medium text-white">
          Get started
        </button>
      </section>
    </main>
  )
}
