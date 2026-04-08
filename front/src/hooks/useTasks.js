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

  const create = async (data) => { await api.create(data); await refresh() }
  const update = async (id, data) => { await api.update(id, data); await refresh() }
  const toggle = async (id) => { await api.toggle(id); await refresh() }
  const remove = async (id) => { await api.remove(id); await refresh() }

  return { tasks, loading, error, create, update, toggle, remove, refresh }
}
