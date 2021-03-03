import Vue from 'vue'
import Vuex from 'vuex'

import reports from './modules/reports'

require('dotenv').config()
console.log(process.env)

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    reports,
  },
});
