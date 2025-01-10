import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

/* Font Awesome */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faCircleUp, 
  faCircleDown, 
  faComment,
  faPlusCircle,
  faList,
  faFilter
} from '@fortawesome/free-solid-svg-icons'

library.add(faCircleUp, faCircleDown, faComment, faPlusCircle, faList, faFilter)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.config.globalProperties.$axios = axios.create({
  baseURL: 'http://localhost:5000/api',
})

app.mount('#app')