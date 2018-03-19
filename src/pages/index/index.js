// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import axios from '@/api.js'
import FastClick from 'fastclick'

import 'lib-flexible'
import '@/css/reset.css'
import '@/css/iconfont.css'

import { getParameters } from '@/utils.js'

window.urlParams = getParameters()     // 链接中的所有参数

Vue.prototype.$http = axios

Vue.use(Mint)

Vue.config.debug = true;
Vue.config.devtools = true;
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

// 阻止页面缩放 - 公共头把页面的meta覆盖了
document.querySelector('meta[name="viewport"]').setAttribute('content', 'initial-scale=1' + ', maximum-scale=1' + ', minimum-scale=1' + ', user-scalable=no')

if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
  }, false);
}
FastClick.attach(document.body)
