import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-08-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'cloudflare-pages',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ??
        (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : ''),
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s %separator %pageName',
      title: 'Vowly',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
