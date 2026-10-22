import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'

// const { data, loading, error, reload } = useApi('/admin/users')
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    api.get(path)
      .then((r) => setState({ data: r, loading: false, error: '' }))
      .catch((e) => setState({ data: null, loading: false, error: e.message }))
  }, [path])
  useEffect(load, [load])
  return { ...state, reload: load }
}
