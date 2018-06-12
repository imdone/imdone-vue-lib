import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/hello'
import Card from '@/components/card'
import List from '@/components/list'
import Board from '@/components/Board'
import tasks from '@/data/imdone-export.json'
import config from '@/data/config.json'
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
  list: 'TODO',
  tasks: lists['TODO']
}

function listsOfTasks () {
  const listsOfTasks = []
  const listsMap = new Map()
  config.lists.forEach(list => {
    list.tasks = []
    listsMap.set(list.name, list)
  })
  tasks.forEach((task) => {
    const name = task.list
    if (!listsMap.get(name)) listsMap.set(name, {name, hidden: false, tasks: []})
    listsMap.get(name).tasks.push(new Task(task))
  })
  listsMap.forEach((list, name) => {
    listsOfTasks.push(list)
  })
  return listsOfTasks
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
      props: list
    },
    {
      path: '/board',
      component: Board,
      props: {
        allowUpdates: true,
        config,
        tasks: listsOfTasks()
      }
    }
  ]
})
