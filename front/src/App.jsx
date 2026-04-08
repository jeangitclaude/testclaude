import { useMemo, useState } from 'react'
import { useTasks } from './hooks/useTasks.js'
import TaskForm from './components/TaskForm.jsx'
import TaskFilters from './components/TaskFilters.jsx'
import TaskList from './components/TaskList.jsx'

export default function App() {
  const { tasks, loading, error, create, update, toggle, remove } = useTasks()
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed)
    if (filter === 'done') return tasks.filter((t) => t.completed)
    return tasks
  }, [tasks, filter])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Todolist</h1>

      <TaskForm onCreate={create} />

      <div className="my-6 flex items-center justify-between">
        <TaskFilters value={filter} onChange={setFilter} />
        <span className="text-sm text-slate-500">{tasks.length} tâche(s)</span>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">Erreur : {error}</div>
      )}
      {loading ? (
        <p className="text-center text-slate-500 py-8">Chargement…</p>
      ) : (
        <TaskList tasks={filtered} onToggle={toggle} onUpdate={update} onRemove={remove} />
      )}
    </div>
  )
}
