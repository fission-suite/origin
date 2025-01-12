import { createPinia } from 'pinia'
import { OriginPlugin } from '@/plugins'
import { useMainStore } from '@/store/main'
import { useWebnativeStore } from '@/store/webnative'

export const install: OriginPlugin = ({ app, router, initialState }) => {
  const pinia = createPinia()
  app.use(pinia)

  if (import.meta.env.SSR) {
    // this will be stringified and set to window.__INITIAL_STATE__
    initialState.pinia = pinia.state.value
  } else {
    // on the client side, we restore the state
    pinia.state.value = initialState?.pinia || {}
  }

  router.beforeEach(async (to, from, next) => {
    const store = useMainStore(pinia)
    store.initialize()

    const webnativeStore = useWebnativeStore(pinia)
    await webnativeStore.initialize()
    next()
  })
}
