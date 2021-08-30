import { defineStore } from 'pinia'

import * as webnative from 'webnative'
import { State } from 'webnative'
import FileSystem from 'webnative/fs/filesystem'

webnative.setup.debug({ enabled: true })

const permissions = {
  permissions: {
    app: {
      name: 'origin',
      creator: 'arg'
    }
  }
}

interface WebnativeState {
  state: State | null
  authed: boolean
  username: string | null
  wnfs: FileSystem | null
}

export const useWebnativeStore = defineStore({
  id: 'webnative',
  state: (): WebnativeState => ({
    state: null,
    authed: false,
    username: null,
    wnfs: null
  }),
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
              this.wnfs = state.fs ?? null
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
              console.log('Secure context required by webnative')
              // We need a secure context to do cryptography
              // Usually this means we need HTTPS or localhost
              break

            case webnative.InitialisationError.UnsupportedBrowser:
              console.log('Browser not supported by webnative')
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
    },
    async readCount() {
      if (this.wnfs) {
        const path = this.wnfs.appPath(webnative.path.file('count.json'))

        if (await this.wnfs.exists(path)) {
          const val = (await this.wnfs.read(path)) as string
          const { count } = JSON.parse(val)
          return count
        } else {
          return 0
        }
      }
    },
    async writeCount(count: number) {
      if (this.wnfs) {
        const path = this.wnfs.appPath(webnative.path.file('count.json'))
        await this.wnfs.write(path, JSON.stringify({ count }))
        await this.wnfs.publish()
      }
    }
  }
})
