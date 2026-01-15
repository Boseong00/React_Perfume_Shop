import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버 보안 헤더 설정
    headers: {
      // XSS 보호
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      // HTTPS 강제 (프로덕션에서 중요)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      // Content Security Policy
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: http:; " +
        "connect-src 'self';"
    }
  },
  build: {
    // 빌드 보안 설정
    sourcemap: false, // 프로덕션에서 소스맵 비활성화
    minify: 'terser', // 코드 난독화
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true
      }
    }
  }
})
