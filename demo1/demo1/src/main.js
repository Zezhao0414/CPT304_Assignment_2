import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import enLocale from 'element-ui/lib/locale/lang/en'
import App from './App.vue';

Vue.use(ElementUI, {enLocale});
Vue.config.silent = true
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
