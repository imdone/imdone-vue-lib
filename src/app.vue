<template lang="pug">
#app
  router-view
</template>

<script>
window.CodeMirror = require('codemirror')

export default {
  name: 'app'
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}
html {
  overflow-y: hidden;
}


</style>
