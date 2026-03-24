'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { User, MessageCircle, ArrowUp, Star, Copy, Check, Users, Award } from 'lucide-react'

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [referral, setReferral] = useState<{ code: string, count: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [badges, setBadges] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { if (d.code) setReferral(d) })
    fetch('/api/badges')
      .then(r => r.json())
      .then(d => { if (d.badges) setBadges(d.badges) })
  }, [])

  function copyLink() {
    if (!referral) return
    const url = `${window.location.origin}/join/${referral.code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>
      </div>
      <Footer />
    </main>
  )

  if (!data?.user) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)', fontSize: '.875rem' }}>Please <a href="/auth" style={{ color: 'var(--blue)' }}>sign in</a> to view your profile.</p>
      </div>
      <Footer />
    </main>
  )

  const { user, postCount, replyCount } = data

  const trustColors: Record<string, string> = {
    new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '24px 20px', width: '100%' }}>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-d)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} style={{ color: 'var(--blue)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)' }}>{user.nickname}</h1>
              <span style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: trustColors[user.trust_level] || 'var(--t4)' }}>
                {user.trust_level || 'new'} member
              </span>
            </div>
            <a href="/settings" style={{ marginLeft: 'auto', fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', color: 'var(--t2)', textDecoration: 'none' }}>
              Settings
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { icon: <ArrowUp size={16} />, label: 'Posts', value: postCount || 0 },
              { icon: <MessageCircle size={16} />, label: 'Replies', value: replyCount || 0 },
              { icon: <Star size={16} />, label: 'Trust', value: user.trust_level || 'new' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--t4)', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Account Details</h2>
          {[
            { label: 'Age range', value: user.age_range },
            { label: 'Gender', value: user.gender },
            { label: 'Member since', value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>{item.label}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Award size={15} style={{ color: '#F59E0B' }} />
              <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)' }}>Badges</h2>
              <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--t4)' }}>{badges.length} earned</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {badges.map(badge => (
                <div
                  key={badge.id}
                  title={badge.description}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--bg)', border: '1px solid var(--bd)',
                    borderRadius: 'var(--r)', padding: '6px 10px',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{badge.emoji}</span>
                  <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)' }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {referral && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={15} style={{ color: 'var(--blue)' }} />
              <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)' }}>Referral</h2>
              <span style={{ marginLeft: 'auto', fontSize: '.75rem', fontWeight: 700, color: 'var(--blue)' }}>{referral.count} {referral.count === 1 ? 'person' : 'people'} joined</span>
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--t3)', marginBottom: 12, lineHeight: 1.5 }}>
              Share your link. You get +5 rep for each person who joins wiispr.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '9px 12px' }}>
              <span style={{ flex: 1, fontSize: '.8rem', color: 'var(--t2)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/join/${referral.code}` : `/join/${referral.code}`}
              </span>
              <button onClick={copyLink} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t4)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/settings" style={{ flex: 1, padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t2)', fontSize: '.8rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Settings</a>
          <a href="/notifications" style={{ flex: 1, padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t2)', fontSize: '.8rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Notifications</a>
        </div>
      </div>
      <Footer />
    </main>
  )
}