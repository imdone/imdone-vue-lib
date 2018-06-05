<template lang="pug">
.card.list
  header.card-header
    p.card-header-title {{list.name}}
    a.card-header-icon(href='#' aria-label='more options')
      span.icon
        i.fas.fa-angle-down(aria-hidden='true')
  .card-content.tasks(:data-list="list.name")
    card(v-for="task in list.tasks" :task="task" :key="task.id")
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
  .list {
    height: 100%;
    min-height: 100%;
    width: 340px;
  }
  .tasks {
    padding: 5px;
    height: 90vh;
    min-height: 90vh;
    overflow-y: auto;
  }
</style>
