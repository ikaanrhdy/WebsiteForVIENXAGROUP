import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, SearchField, State } from './ui.jsx'

export default function SalesChat({ admin = false }) {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationSearch, setConversationSearch] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const filteredCustomers = customers.filter((customer) => [
    customer.name, customer.email, customer.last_message,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(conversationSearch.trim().toLocaleLowerCase('id-ID'))))
  const filteredMessages = messages.filter((message) => [
    message.message, message.sender?.name,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(messageSearch.trim().toLocaleLowerCase('id-ID'))))

  const loadConversations = useCallback(async () => {
    if (!admin) return
    try {
      const response = await api.get('/admin/sales-chat/conversations')
      const list = response.data || []
      setCustomers(list)
      setCustomerId((current) => current || list[0]?.id || null)
    } catch (e) {
      setError(e.message)
    }
  }, [admin])

  const loadMessages = useCallback(async () => {
    if (admin && !customerId) {
      setMessages([])
      setLoading(false)
      return
    }
    try {
      const path = admin ? `/admin/sales-chat/${customerId}/messages` : '/me/sales-chat'
      const response = await api.get(path)
      setMessages(response.data || [])
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [admin, customerId])

  useEffect(() => { loadConversations() }, [loadConversations])
  useEffect(() => {
    setLoading(true)
    loadMessages()
    const timer = window.setInterval(() => {
      loadMessages()
      loadConversations()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [loadMessages, loadConversations])

  const send = async (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    setSending(true)
    setError('')
    try {
      const path = admin ? `/admin/sales-chat/${customerId}/messages` : '/me/sales-chat'
      await api.post(path, { message: draft.trim() })
      setDraft('')
      await loadMessages()
      await loadConversations()
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h1 className="ptitle">Chat penjualan</h1>
      <div className={admin ? 'sales-chat admin-chat' : 'sales-chat'}>
        {admin && (
          <Card title="Percakapan">
            <div className="conversation-list">
              <SearchField value={conversationSearch} onChange={setConversationSearch} placeholder="Cari percakapan..." />
              {filteredCustomers.map((customer) => (
                <button className={customerId === customer.id ? 'conversation active' : 'conversation'} key={customer.id} onClick={() => setCustomerId(customer.id)}>
                  <b>{customer.name}</b>
                  <span>{customer.last_message || customer.email}</span>
                  {!!customer.unread_count && <small>{customer.unread_count}</small>}
                </button>
              ))}
              {!filteredCustomers.length && <p className="conversation-empty">{customers.length ? 'Tidak ada percakapan yang cocok.' : 'Belum ada percakapan pelanggan.'}</p>}
            </div>
          </Card>
        )}
        <Card
          title={admin ? customers.find((customer) => customer.id === customerId)?.name || 'Pilih percakapan' : 'Hubungi admin penjualan'}
          action={<SearchField value={messageSearch} onChange={setMessageSearch} placeholder="Cari pesan..." />}
        >
          {error && <div className="alert">{error}</div>}
          <State loading={loading && !messages.length} />
          <div className="chat-thread">
            {filteredMessages.map((message) => (
              <div className={message.sender_id === user.id ? 'thread-message mine' : 'thread-message'} key={message.id}>
                <b>{message.sender?.name || (message.sender_id === user.id ? user.name : 'Admin VIENXA')}</b>
                <p>{message.message}</p>
                <small>{new Date(message.created_at).toLocaleString('id-ID')}</small>
              </div>
            ))}
            {!filteredMessages.length && !loading && <p className="muted">{messages.length ? 'Tidak ada pesan yang cocok dengan pencarian.' : 'Mulai percakapan untuk bertanya tentang produk atau pesanan.'}</p>}
          </div>
          <form className="chat-compose" onSubmit={send}>
            <input aria-label="Pesan" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={3000} placeholder="Tulis pesan…" disabled={admin && !customerId} />
            <button className="btn" disabled={sending || !draft.trim() || (admin && !customerId)}>{sending ? 'Mengirim…' : 'Kirim'}</button>
          </form>
        </Card>
      </div>
    </>
  )
}
