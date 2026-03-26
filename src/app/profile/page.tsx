'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { User, MessageCircle, ArrowUp, Star, Copy, Check, Users, Award, Bookmark, Shield, X } from 'lucide-react'
import { timeAgo } from '@/lib/time'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [referral, setReferral] = useState<{ code: string, count: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [badges, setBadges] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'blocks'>('overview')
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

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

  useEffect(() => {
    if (activeTab === 'saved') {
      setLoadingSaved(true)
      fetch('/api/bookmarks')
        .then(r => r.json())
        .then(d => { setBookmarks(d.bookmarks || []); setLoadingSaved(false) })
    } else if (activeTab === 'blocks') {
      fetch('/api/blocks')
        .then(r => r.json())
        .then(d => setBlocks(d.blocks || []))
    }
  }, [activeTab])

  function copyLink() {
    if (!referral) return
    const url = `${window.location.origin}/join/${referral.code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function removeBookmark(postId: string) {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'remove' })
    })
    setBookmarks(prev => prev.filter(b => b.id !== postId))
    toast('Removed from saved')
  }

  async function unblock(ghostId: string) {
    await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ghostId, action: 'unblock' })
    })
    setBlocks(prev => prev.filter(b => b.blocked_ghost_id !== ghostId))
    toast('Unblocked ' + ghostId)
  }

  if (loading) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>
      </div>
      <Footer />
    </main>
  )

  if (!data?.user) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
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

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'saved', label: 'Saved', icon: <Bookmark size={12} /> },
    { key: 'blocks', label: 'Blocked', icon: <Shield size={12} /> },
  ]

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
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
              { icon: <Star size={16} />, label: 'Rep', value: user.rep_score || 0 },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--t4)', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 'var(--r)',
                border: '1px solid var(--bd)',
                background: activeTab === t.key ? 'var(--blue)' : 'var(--sur)',
                color: activeTab === t.key ? '#fff' : 'var(--t2)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6, transition: 'all .15s',
              }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
              <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Account Details</h2>
              {[
                { label: 'Age range', value: user.age_range },
                { label: 'Gender', value: user.gender },
                { label: 'Trust level', value: user.trust_level || 'new' },
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
                  {badges.map((badge: any) => (
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
          </>
        )}

        {activeTab === 'saved' && (
          <div>
            {loadingSaved ? (
              <p style={{ color: 'var(--t4)', fontSize: '.875rem', textAlign: 'center', padding: '24px 0' }}>Loading...</p>
            ) : bookmarks.length === 0 ? (
              <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 20px', textAlign: 'center' }}>
                <Bookmark size={28} style={{ color: 'var(--t4)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No saved posts yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookmarks.map((post: any) => (
                  <div key={post.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <a href={`/post/${post.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>{post.categories?.name}</span>
                        <span style={{ fontSize: '.65rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{post.ghost_id}</span>
                        <span style={{ fontSize: '.6rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>{post.title}</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: '.72rem', color: 'var(--t4)' }}>{post.upvotes} upvotes</span>
                        <span style={{ fontSize: '.72rem', color: 'var(--t4)' }}>{post.reply_count} replies</span>
                      </div>
                    </a>
                    <button onClick={() => removeBookmark(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', flexShrink: 0, padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div>
            {blocks.length === 0 ? (
              <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 20px', textAlign: 'center' }}>
                <Shield size={28} style={{ color: 'var(--t4)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No blocked Ghost IDs</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {blocks.map((b: any) => (
                  <div key={b.blocked_ghost_id} style={{
                    background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--t2)' }}>{b.blocked_ghost_id}</span>
                    <button onClick={() => unblock(b.blocked_ghost_id)} style={{
                      fontSize: '.75rem', fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--rs)',
                      border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Unblock</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <a href="/settings" style={{ flex: 1, padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t2)', fontSize: '.8rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Settings</a>
          <a href="/notifications" style={{ flex: 1, padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t2)', fontSize: '.8rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Notifications</a>
        </div>
      </div>
      <Footer />
    </main>
  )
}
