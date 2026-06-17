import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LIFF ID が空または PLACEHOLDER の場合はビルドを失敗させる
const liffId = process.env.VITE_LIFF_ID;
if (!liffId || liffId === 'PLACEHOLDER' || liffId.trim() === '') {
  throw new Error(
    'VITE_LIFF_ID が設定されていません。.env.prod を確認してください。'
  );
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  define: {
    __LIFF_ID__: JSON.stringify(liffId),
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || '')
  }
});
