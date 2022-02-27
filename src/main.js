import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import '@/utils/ajax'
import '@/assets/global.css'
import '@/utils/elementui'
import '@/utils/permission'
import '@/utils/icons'
import '@/utils/markdown'

Vue.prototype.$qiniu='http://r6ikcsmmm.hn-bkt.clouddn.com/';
Vue.config.productionTip = false;


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
