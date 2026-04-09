import { useEffect, useState } from 'react'

const PRIORITY_LABEL = { 0: 'Basse', 1: 'Moyenne', 2: 'Haute' }
const PRIORITY_COLOR = {
  0: 'bg-slate-200 text-slate-700',
  1: 'bg-amber-200 text-amber-800',
  2: 'bg-red-200 text-red-800',
}

export default function TaskItem({ task, onToggle, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)

  useEffect(() => { setTitle(task.title) }, [task.title])
  useEffect(() => { setDescription(task.description || '') }, [task.description])
  useEffect(() => { setPriority(task.priority) }, [task.priority])

  function save() {
    const trimmedTitle = title.trim()
    const trimmedDesc = description.trim() || null
    if (!trimmedTitle) {
      cancel()
      return
    }
    if (trimmedTitle !== task.title || trimmedDesc !== (task.description || null) || priority !== task.priority) {
      onUpdate(task.id, { title: trimmedTitle, description: trimmedDesc, priority })
    }
    setEditing(false)
  }

  function cancel() {
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority)
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
          <div className="space-y-2">
            <input
              autoFocus
              className="w-full border rounded px-2 py-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              placeholder="Titre"
            />
            <textarea
              className="w-full border rounded px-2 py-1 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') cancel() }}
              placeholder="Description (optionnel)"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={0}>Basse</option>
                <option value={1}>Moyenne</option>
                <option value={2}>Haute</option>
              </select>
              <button onClick={save} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">OK</button>
              <button onClick={cancel} className="text-sm text-slate-500 hover:text-slate-700">Annuler</button>
            </div>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="cursor-pointer">
            <div className={`font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </div>
            {task.description && (
              <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{task.description}</p>
            )}
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${PRIORITY_COLOR[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>
        )}
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
