export default defineEventHandler((event) => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  setResponseHeader(
    event,
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://i.pinimg.com https://one-tawny-two.vercel.app; font-src 'self'; connect-src 'self' https://api.cloudinary.com https://cloudflareinsights.com; frame-src https://www.google.com https://maps.google.com https://maps.googleapis.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  )
})
