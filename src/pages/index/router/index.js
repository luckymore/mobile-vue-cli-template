import Vue from 'vue'
import Router from 'vue-router'

import FillInformation from '../FillInformation'
import Result from '../Result'
import Protocol from '../Protocol'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'FillInformation',
      component: FillInformation
    },
    {
      path: '/result',
      name: 'Result',
      component: Result
    },
    {
      path: '/protocol',
      name: 'Protocol',
      component: Protocol
    },
  ]
})
