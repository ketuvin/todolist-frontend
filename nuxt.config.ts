// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['nuxt-graphql-client', '@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      GQL_HOST: 'http://127.0.0.1:8080/graphql'
    }
  }
})
