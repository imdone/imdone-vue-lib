<template lang="pug">
.card.list
  header.card-header
    p.card-header-title {{list.name}}
    a.card-header-icon(href='#' aria-label='more options')
      span.icon
        i.fas.fa-angle-down(aria-hidden='true')
  .card-content
    .overflow-container
      .tasks(:data-list="list.name")
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
    max-height: 100%;
    width: 340px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .card-content {
    display: flex;
    flex: 1;
    min-height: 0px;
    padding: 0;
  }
  .overflow-container {
    flex: 1;
    overflow: auto;
  }
  .tasks {
    padding: 1.5em;
  }
</style>
