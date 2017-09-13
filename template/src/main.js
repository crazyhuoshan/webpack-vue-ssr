import Vue from 'vue'
import App from './App.vue'

export function createApp(ssrContext) {
  const app = new Vue({
    ssrContext,
    render: h => h(App),
  })
  return { app }
}
