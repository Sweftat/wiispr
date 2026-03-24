'use client'
import { useState } from 'react'
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminNotifyAll({ userCount }: { userCount: number }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function send() {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/notify-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ type: 'success', text: `Notification sent to ${data.sent} users.` })
        setMessage('')
      } else {
        setResult({ type: 'error', text: data.error || 'Something went wrong.' })
      }
    } catch {
      setResult({ type: 'error', text: 'Network error. Please try again.' })
    }
    setSending(false)
    setConfirming(false)
  }

  function handleSendClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    send()
  }

  function cancel() {
    setConfirming(false)
  }

  const canSend = message.trim().length > 0 && !sending

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Notify All Users</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>
          Send an in-app notification to every user on the platform.
        </p>
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
        {/* Reach indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--blue-d)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', marginBottom: 20 }}>
          <Bell size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
          <p style={{ fontSize: '.8rem', color: 'var(--blue)', fontWeight: 600 }}>
            This will notify <strong>{userCount}</strong> {userCount === 1 ? 'user' : 'users'} immediately.
          </p>
        </div>

        {/* Message composer */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={e => { setMessage(e.target.value); setConfirming(false); setResult(null) }}
            placeholder="Write your notification message..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '.875rem',
              color: 'var(--t1)',
              background: 'var(--bg)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
          <p style={{ fontSize: '.7rem', color: 'var(--t4)', marginTop: 4, textAlign: 'right' }}>
            {message.length} characters
          </p>
        </div>

        {/* Result feedback */}
        {result && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            background: result.type === 'success' ? 'var(--grn-d)' : 'var(--rose-d)',
            border: `1px solid ${result.type === 'success' ? 'var(--grn)' : 'var(--rose)'}`,
            borderRadius: 'var(--r)', marginBottom: 14
          }}>
            {result.type === 'success'
              ? <CheckCircle size={14} style={{ color: 'var(--grn)', flexShrink: 0 }} />
              : <AlertCircle size={14} style={{ color: 'var(--rose)', flexShrink: 0 }} />
            }
            <p style={{ fontSize: '.8rem', fontWeight: 500, color: result.type === 'success' ? 'var(--grn)' : 'var(--rose)' }}>
              {result.text}
            </p>
          </div>
        )}

        {/* Confirm state */}
        {confirming && (
          <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', marginBottom: 12 }}>
            <p style={{ fontSize: '.8rem', color: 'var(--t2)', marginBottom: 10 }}>
              Are you sure? This will send a notification to <strong style={{ color: 'var(--t1)' }}>all {userCount} users</strong> and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={send}
                disabled={sending}
                style={{ flex: 1, padding: '8px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {sending ? 'Sending...' : 'Yes, send now'}
              </button>
              <button
                onClick={cancel}
                disabled={sending}
                style={{ padding: '8px 16px', borderRadius: 'var(--r)', background: 'none', color: 'var(--t2)', border: '1px solid var(--bd)', fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!confirming && (
          <button
            onClick={handleSendClick}
            disabled={!canSend}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              width: '100%', padding: '10px',
              borderRadius: 'var(--r)',
              background: canSend ? 'var(--blue)' : 'var(--bd)',
              color: '#fff',
              border: 'none',
              fontSize: '.875rem', fontWeight: 600,
              cursor: canSend ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'background .15s',
            }}
          >
            <Send size={14} />
            Send to all users
          </button>
        )}
      </div>
    </div>
  )
}
