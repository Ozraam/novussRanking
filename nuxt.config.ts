// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/supabase',
        '@nuxtjs/eslint-module',
        '@nuxt/ui',
    ],

    eslint: {
        fix: true,
    },

    css: [
        '~/assets/scss/global.scss'
    ],

    supabase: {
        redirect: false
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/scss/colors.scss";'
                }
            }
        }
    }
})
