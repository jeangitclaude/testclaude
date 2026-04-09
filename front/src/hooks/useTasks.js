import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setTasks(await api.list())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = async (data) => {
    const tempId = crypto.randomUUID()
    const tempTask = {
      id: tempId,
      title: data.title,
      description: data.description || null,
      completed: false,
      priority: data.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const prev = tasks
    setTasks([tempTask, ...prev])
    try {
      const created = await api.create(data)
      setTasks((cur) => cur.map((t) => (t.id === tempId ? created : t)))
    } catch (e) {
      setTasks(prev)
      setError(e.message)
    }
  }

  const update = async (id, data) => {
    const prev = tasks
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...data } : t)))
    try {
      await api.update(id, data)
    } catch (e) {
      setTasks(prev)
      setError(e.message)
    }
  }

  const toggle = async (id) => {
    const prev = tasks
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    try {
      await api.toggle(id)
    } catch (e) {
      setTasks(prev)
      setError(e.message)
    }
  }

  const remove = async (id) => {
    const prev = tasks
    setTasks(tasks.filter((t) => t.id !== id))
    try {
      await api.remove(id)
    } catch (e) {
      setTasks(prev)
      setError(e.message)
    }
  }

  return { tasks, loading, error, create, update, toggle, remove, refresh }
}
