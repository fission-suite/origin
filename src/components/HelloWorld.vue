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

  <div v-if="!fissionAuth.authed">
    <p>
      Use
      <a href="https://github.com/fission-suite/webnative" target="_blank"
        >Fission webnative</a
      >
      for auth and storage.
    </p>
    <button
      v-if="!fissionAuth.authed"
      @click="fissionAuthStore.redirectToLobby"
    >
      Sign in with Fission
    </button>
  </div>
  <div v-if="fissionAuth.authed">
    <p>
      Welcome {{ fissionAuth.username }} 👋, you are signed in with Fission!
    </p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

import { useFissionAuthStore } from '@/store/fissionAuth'

// tip: you can use this compile time macro with ts literals to setup the props
defineProps<{ msg: string }>()

const count = ref(0)

const fissionAuthStore = useFissionAuthStore()
fissionAuthStore.initialize()

const fissionAuth = reactive({
  authed: fissionAuthStore.authed,
  username: fissionAuthStore.username
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
