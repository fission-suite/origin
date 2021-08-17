import { defineStore } from 'pinia'

import * as webnative from 'webnative'
import { State } from 'webnative'

webnative.setup.debug({ enabled: true })

const permissions = {
  permissions: {
    app: {
      name: 'origin',
      creator: 'arg'
    }
  }
}

interface AuthState {
  state: State | null
  authed: boolean
  username: string | null
}

export const useFissionAuthStore = defineStore({
  id: 'fissionAuth',
  state: (): AuthState => ({
    state: null,
    authed: false,
    username: null
  }),
  getters: {
    isAuthed(state) {
      return state.authed
    },
    getUsername(state) {
      return state.username
    }
  },
  actions: {
    async initialize() {
      await webnative
        .initialise(permissions)
        .then((state) => {
          this.state = state

          switch (state?.scenario) {
            case webnative.Scenario.AuthSucceeded:
            case webnative.Scenario.Continuation:
              this.username = state.username
              this.authed = true
              break

            case webnative.Scenario.AuthCancelled:
            case webnative.Scenario.NotAuthorised:
              this.authed = false
              break

            default:
              this.authed = false
              this.username = null
              break
          }
        })
        .catch((err) => {
          switch (err) {
            case webnative.InitialisationError.InsecureContext:
              // We need a secure context to do cryptography
              // Usually this means we need HTTPS or localhost
              break

            case webnative.InitialisationError.UnsupportedBrowser:
              // Browser not supported.
              // Example: Firefox private mode can't use indexedDB.
              break
          }
        })
    },
    redirectToLobby() {
      if (this.state?.permissions) {
        webnative.redirectToLobby(this.state.permissions)
      }
    }
  }
})
