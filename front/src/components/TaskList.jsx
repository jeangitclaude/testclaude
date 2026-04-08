import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onToggle, onUpdate, onRemove }) {
  if (tasks.length === 0) {
    return <p className="text-center text-slate-500 py-8">Aucune tâche.</p>
  }
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onToggle={onToggle} onUpdate={onUpdate} onRemove={onRemove} />
      ))}
    </ul>
  )
}
