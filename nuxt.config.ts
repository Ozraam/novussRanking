// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/supabase',
        '@nuxtjs/eslint-module',
    ],

    eslint: {
        fix: true,
    },

    css: [
        '~/assets/css/global.scss'
    ],

    supabase: {
        redirect: false
    }
})
