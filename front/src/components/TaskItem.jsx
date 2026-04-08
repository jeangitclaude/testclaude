import { useState } from 'react'

const PRIORITY_LABEL = { 0: 'Basse', 1: 'Moyenne', 2: 'Haute' }
const PRIORITY_COLOR = {
  0: 'bg-slate-200 text-slate-700',
  1: 'bg-amber-200 text-amber-800',
  2: 'bg-red-200 text-red-800',
}

export default function TaskItem({ task, onToggle, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  async function save() {
    if (title.trim() && title !== task.title) {
      await onUpdate(task.id, { title: title.trim(), description: task.description, priority: task.priority })
    } else {
      setTitle(task.title)
    }
    setEditing(false)
  }

  return (
    <li className="bg-white rounded-lg shadow p-3 flex items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setTitle(task.title); setEditing(false) } }}
          />
        ) : (
          <div
            className={`font-medium cursor-text ${task.completed ? 'line-through text-slate-400' : ''}`}
            onClick={() => setEditing(true)}
          >
            {task.title}
          </div>
        )}
        {task.description && (
          <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{task.description}</p>
        )}
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${PRIORITY_COLOR[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
      <button
        onClick={() => onRemove(task.id)}
        className="text-red-600 hover:text-red-800 text-sm"
        aria-label="Supprimer"
      >
        Supprimer
      </button>
    </li>
  )
}
