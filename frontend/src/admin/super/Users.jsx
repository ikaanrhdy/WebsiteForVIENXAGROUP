import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api } from '../../lib/api.js'
import { Card, SearchField, State } from '../ui.jsx'

export default function Users() {
  const { data, loading, error, reload } = useApi('/admin/users')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const filteredUsers = (data?.data || []).filter((user) => [
    user.name, user.email, user.phone, user.role, user.is_active ? 'aktif' : 'nonaktif',
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const act = async (fn) => { setMsg(''); try { await fn(); reload() } catch (e) { setMsg(e.message) } }
  const toggle = (u) => act(() => api.put(`/admin/users/${u.id}`, { is_active: !u.is_active }))
  const remove = (u) => window.confirm(`Hapus pengguna ${u.name}? Pesanannya ikut terhapus.`) && act(() => api.del(`/admin/users/${u.id}`))

  return (
    <>
      <h1 className="ptitle">Pengguna</h1>
      {msg && <div className="alert">{msg}</div>}
      <Card title="Daftar pengguna" action={<SearchField value={search} onChange={setSearch} placeholder="Cari pengguna..." />}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Email</th><th>WhatsApp</th><th>Peran</th><th>Pesanan</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filteredUsers.length === 0 && <tr><td colSpan={7} className="muted">{search ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna.'}</td></tr>}
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td>
                    <td>{u.role === 'super_admin' ? 'Super Admin' : 'User'}</td>
                    <td>{u.orders_count ?? 0}</td>
                    <td><span className={`badge ${u.is_active ? 'success' : 'secondary'}`}>{u.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="right">
                      {u.role !== 'super_admin' && (
                        <>
                          <button className="btn sm ghost" onClick={() => toggle(u)}>{u.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>{' '}
                          <button className="btn sm danger" onClick={() => remove(u)}>Hapus</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
