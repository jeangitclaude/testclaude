import { useState } from 'react'

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onCreate({ title: title.trim(), description: description.trim() || null, priority: Number(priority) })
      setTitle(''); setDescription(''); setPriority(1)
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <input
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Titre de la tâche"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Description (optionnel)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <select
          className="border rounded px-3 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value={0}>Basse</option>
          <option value={1}>Moyenne</option>
          <option value={2}>Haute</option>
        </select>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </div>
    </form>
  )
}
