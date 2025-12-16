import { defineStore } from 'pinia'



export const useLocalUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    eid: 0,
    loginkey: '',
    accesstoken: '',
    userInfo: {},
    enteriseinfo: {}
  }),

  getters: {

  },
  actions: {
    login(data) {
      this.isLoggedIn = true
      this.eid = data.eid
      this.loginkey = data.loginkey
      this.userInfo = data.userInfo
      this.enteriseinfo = data.enteriseinfo
      this.accesstoken = data.accesstoken
    },
    logout() {
      this.isLoggedIn = false
      this.eid = 0
      this.loginkey = ''
      this.accesstoken = ''
      this.userInfo = {}
      this.enteriseinfo = {}
    }
  }
})
