import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @vitejs/plugin-react injects JSX source info in dev mode, so every React
// fiber carries `_debugSource` (fileName/lineNumber). Muse uses that for
// element -> source mapping. See src/muse/sourceLocation.ts.
export default defineConfig({
  plugins: [react()],
})
