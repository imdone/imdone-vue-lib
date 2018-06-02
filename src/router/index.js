import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/hello'
import Card from '@/components/card'
import List from '@/components/list'
import tasks from '@/data/imdone-export.json'
import * as Task from 'imdone-core/lib/task'

Vue.use(Router)

const lists = {}
tasks.forEach(task => {
  const list = task.list
  if (!lists[list]) lists[list] = []
  lists[list].push(new Task(task, true))
})
const task = new Task(tasks[8], true)
const list = {
  name: 'TODO',
  tasks: lists['TODO']
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/card',
      component: Card,
      props: {
        task
      }
    },
    {
      path: '/list',
      component: List,
      props: {
        list
      }
    }
  ]
})
