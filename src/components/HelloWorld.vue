<template>
  <h1>{{ msg }}</h1>

  <p>
    Recommended setup:
    <a href="https://code.visualstudio.com/" target="_blank">VSCode</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    +
    <a
      href="https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg"
      >Vue devtools (beta)</a
    >
  </p>

  <p>
    See
    <code>README.md</code> for more information.
  </p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank"
      >Vite Docs</a
    >
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>

  <button @click="count++">count is: {{ count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>

  <div v-if="!webnativeState.authed">
    <p>
      Use
      <a href="https://github.com/fission-suite/webnative" target="_blank"
        >Fission webnative</a
      >
      for auth and storage.
    </p>
    <button
      v-if="!webnativeState.authed"
      @click="webnativeStore.redirectToLobby"
    >
      Sign in with Fission
    </button>
  </div>
  <div v-if="webnativeState.authed">
    <p>
      Welcome {{ webnativeState.username }} 👋, you are signed in with Fission!
    </p>
    <button @click="storedCount++">stored count is: {{ storedCount }}</button>
    <p>
      The value of stored count is saved in IPFS by the Webantive Filesystem
      (WNFS).
    </p>
    <ul>
      <li>
        View your count in
        <a
          :href="
            'https://drive.fission.codes/#/' +
            webnativeState.username +
            '/Apps/arg/origin'
          "
          target="_blank"
          >Fission Drive</a
        >
      </li>
      <li>
        <a
          href="https://guide.fission.codes/accounts/account-signup/account-linking"
          target="_blank"
          >Link your account</a
        >
        to sync your count across devices or browsers.
      </li>
      <li>
        <a
          href="https://guide.fission.codes/developers/webnative"
          target="
      _blank"
          >Learn more</a
        >
        about the webnative SDK.
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, watchEffect } from 'vue'

import { useWebnativeStore } from '@/store/webnative'

// tip: you can use this compile time macro with ts literals to setup the props
defineProps<{ msg: string }>()

const count = ref(0)
const storedCount = ref(0)

const webnativeStore = useWebnativeStore()
webnativeStore.initialize()

const webnativeState = reactive({
  authed: webnativeStore.authed,
  username: webnativeStore.username
})

watch(storedCount, (newCount, _) => {
  webnativeStore.writeCount(newCount)
})

watchEffect(async () => {
  if (webnativeStore.wnfs) {
    storedCount.value = await webnativeStore.readCount()
  }
})
</script>

<style scoped>
a {
  color: #0773ff;
  font-weight: bold;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

button {
  padding: 5px 10px;
}

code,
pre {
  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console,
    monospace;
  background-color: #eee;
  padding: 5px;
  border-radius: 2px;
  color: #304455;
}
</style>
