import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@w3ux/crypto': resolve(__dirname, '../library/crypto/src'),
      '@w3ux/extension-assets': resolve(
        __dirname,
        '../library/extension-assets/src'
      ),
      '@w3ux/factories': resolve(__dirname, '../library/factories/src'),
      '@w3ux/hooks': resolve(__dirname, '../library/hooks/src'),
      '@w3ux/observables-connect': resolve(
        __dirname,
        '../library/observables-connect/src'
      ),
      '@w3ux/react-connect-kit': resolve(
        __dirname,
        '../library/react-connect-kit/src'
      ),
      '@w3ux/react-odometer': resolve(
        __dirname,
        '../library/react-odometer/src'
      ),
      '@w3ux/react-polkicon': resolve(
        __dirname,
        '../library/react-polkicon/src'
      ),
      '@w3ux/types': resolve(__dirname, '../library/types/src'),
      '@w3ux/utils': resolve(__dirname, '../library/utils/src'),
      '@w3ux/validator-assets': resolve(
        __dirname,
        '../library/validator-assets/src'
      ),
    },
  },
})
