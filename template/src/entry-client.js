import { createApp } from './main'

const { app } = createApp()

if (document.getElementById('app')) {
  app.$mount('#app')
} else {
  app.$mount('#app-client')
}
