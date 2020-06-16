import Vue from 'vue'
import Router from 'vue-router'
import Card from '@/components/card'
import List from '@/components/list'
import Board from '@/components/board'
import Detail from '@/components/detail'
import tasks from '@/data/imdone-export.json'
import config from '@/data/config.json'
import * as Task from 'imdone-core/lib/task'

Vue.use(Router)

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

const board = {
  config,
  lists: listsOfTasks()
}

const list = board.lists[0]

const task = list.tasks[0]

export default new Router({
  routes: [
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
        value: list,
        board: board
      }
    },
    {
      path: '/board',
      component: Board,
      props: {
        repoURL: '',
        allowUpdates: true,
        board
      }
    },
    {
      path: '/detail',
      component: Detail,
      props: {task}
    }
  ]
})
