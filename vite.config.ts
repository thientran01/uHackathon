import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { musePlugin } from './server/musePlugin'

// @vitejs/plugin-react injects JSX source info in dev mode, so every React
// fiber carries `_debugSource` (fileName/lineNumber). Muse uses that for
// element -> source mapping. See src/muse/sourceLocation.ts.
// musePlugin() adds the /api/muse/* endpoints to the dev server.
export default defineConfig({
  plugins: [react(), musePlugin()],
})
