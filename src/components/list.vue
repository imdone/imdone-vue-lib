<template lang="pug">
.card
  header.card-header
    p.card-header-title {{list.name}}
    a.card-header-icon(href='#' aria-label='more options')
      span.icon
        i.fas.fa-angle-down(aria-hidden='true')
  .card-content
    .list(data-list="list.name")
      card(v-for="task in list.tasks" :task="task")
</template>
<script>
import Card from '@/components/card'
export default {
  name: 'imdone-list',
  components: {
    Card
  },
  props: ['list']
}
</script>
<style lang="scss" scoped>
  .card {
    width: 340px;
    height: 96%;
  }
  .card-content {
    height: 800px;
    overflow-y: auto;
  }
</style>
