import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/vegan_map/',
  // Keep resolution inside this checkout, including restricted Windows workspaces.
  resolve: { preserveSymlinks: true },
})
