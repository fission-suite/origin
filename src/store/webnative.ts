/** ✨ Webnative Auth and Storage Provider ✨
 *
 * See https://guide.fission.codes/developers/webnative for the complete webnative
 * documentation. 📚
 */

import { defineStore } from 'pinia'

import * as webnative from 'webnative'
import { State } from 'webnative'
import FileSystem from 'webnative/fs/filesystem'

/** Debug logs
 * Uncomment the following line show webnative debug messages.
 * See https://guide.fission.codes/developers/webnative/additional-info#debug-logs for details.
 */

// webnative.setup.debug({ enabled: true })

/** Permissions
 * Origin requests app permissions from the user when they sign in.
 * The requested permissions grant Origin access to use app storage for arg/origin.
 */

const permissions = {
  permissions: {
    app: {
      name: 'origin',
      creator: 'arg'
    }
  }
}

/** Webnative State
 * state: webnative representation of state
 * authed: The user has signed in with Fission and granted permissions or not
 * username: Fission username
 * wnfs: Webnative Filesystem, where the user stores their data
 */

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
    /** Initialize webnative
     * If the user has signed in with Fission, their scenario will
     * be AuthSucceeded or Continuation. Set their username, authed state,
     * and WNFS.
     *
     * Otherwise, their scenario will be AuthCancelled or NotAuthorised.
     * The authed state should be false and username and WNFS are not set.
     */

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

    /** Redirect to Fission auth lobby
     * When a user signs into Fission, they are redirected to the Fission
     * auth lobby (https://auth.fission.codes/), where they are prompted to
     * grant Origin permission to use their filesystem.
     */

    redirectToLobby() {
      if (this.state?.permissions) {
        webnative.redirectToLobby(this.state.permissions)
      }
    },

    /** Read count
     * The count is stored in WNFS. Read the count if the user has one stored.
     * Otherwise, return a count of 0.
     *
     * The count is stored the first time the user increments it.
     *
     * The appPath helper function prefixes the path to read from arg/origin app
     * directory. appPath is available when the user has granted app permissions
     * and is set internally by webnative
     */

    async readCount() {
      if (this.wnfs && this.wnfs.appPath) {
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

    /** Write count
     * Write the count in the arg/origin directory.
     *
     * Note that publish must be called to persist any changes made in
     * WNFS. Changes include writes, but also other mutations like making
     * a directory or deleting a file.
     */

    async writeCount(count: number) {
      if (this.wnfs && this.wnfs.appPath) {
        const path = this.wnfs.appPath(webnative.path.file('count.json'))
        await this.wnfs.write(path, JSON.stringify({ count }))
        await this.wnfs.publish()
      }
    }
  }
})
