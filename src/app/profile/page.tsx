'use client'
import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  User, MessageCircle, ArrowUp, Star, Copy, Check, Users, Award,
  Bookmark, Shield, ShieldOff, Flame, Ghost, AlertTriangle, Bell,
  Palette, Smartphone, X, Search,
} from 'lucide-react'
import { timeAgo } from '@/lib/time'
import CategoryIcon from '@/components/CategoryIcon'

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#2563EB', sports: '#F97316', lifestyle: '#16A34A',
  business: '#7C3AED', gaming: '#E11D48', family: '#D97706',
  "women's space": '#EC4899', open: '#64748B', entertainment: '#0891B2',
  health: '#EF4444', food: '#EA580C', religion: '#4F46E5',
  relationships: '#BE185D', career: '#0369A1', travel: '#059669',
  finance: '#CA8A04',
}

type Section = 'account' | 'appearance' | 'notifications' | 'push' | 'privacy' | 'following' | 'danger'

export default function ProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [referral, setReferral] = useState<{ code: string; count: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [badges, setBadges] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'blocked'>('overview')
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false)
  const [blocks, setBlocks] = useState<any[]>([])
  const [blocksLoaded, setBlocksLoaded] = useState(false)
  const [follows, setFollows] = useState<string[]>([])
  const [followedCategories, setFollowedCategories] = useState<number[]>([])
  const [followSearch, setFollowSearch] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [followTab, setFollowTab] = useState<'ghosts' | 'categories'>('ghosts')
  const [notifPrefs, setNotifPrefs] = useState({ follows: true, upvotes: true, milestones: true, replies: true })
  const [nickname, setNickname] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [notifSaved, setNotifSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [dark, setDark] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('account')

  // Inline nickname edit state
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameValue, setNicknameValue] = useState('')
  const [nicknameSaving, setNicknameSaving] = useState(false)
  const [nicknameCheck, setNicknameCheck] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const nicknameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDark(localStorage.getItem('theme') === 'dark')
    fetch('/api/profile').then(r => r.json()).then(d => {
      setData(d); setLoading(false)
      if (d.user) {
        setNickname(d.user.nickname || '')
        setAgeRange(d.user.age_range || '')
        if (d.user.notification_prefs) setNotifPrefs(d.user.notification_prefs)
      }
    })
    fetch('/api/referral').then(r => r.json()).then(d => { if (d.code) setReferral(d) })
    fetch('/api/badges').then(r => r.json()).then(d => {
      if (d.badges) {
        setBadges(d.badges)
        const prev = JSON.parse(sessionStorage.getItem('seen_badges') || '[]')
        const fresh = d.earned?.filter((id: string) => !prev.includes(id)) || []
        if (fresh.length > 0) {
          sessionStorage.setItem('seen_badges', JSON.stringify(d.earned))
          setTimeout(() => { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); toast.success('New badge earned!') }, 500)
        } else sessionStorage.setItem('seen_badges', JSON.stringify(d.earned || []))
      }
    })
    fetch('/api/follows').then(r => r.json()).then(d => {
      setFollows(d.ghostIds || d.follows || [])
      setFollowedCategories(d.categoryIds || [])
    })
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => { if (sub) setPushEnabled(true) }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'saved' && !bookmarksLoaded) {
      fetch('/api/bookmarks').then(r => r.json()).then(d => { setBookmarks(d.bookmarks || []); setBookmarksLoaded(true) })
    } else if (activeTab === 'blocked' && !blocksLoaded) {
      fetch('/api/blocks').then(r => r.json()).then(d => { setBlocks(d.blocks || []); setBlocksLoaded(true) })
    }
  }, [activeTab, bookmarksLoaded, blocksLoaded])

  // Fetch categories on mount (needed for the following section)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      fetch(`${url}/rest/v1/categories?is_active=eq.true&order=sort_order`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      }).then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d) })
    }
  }, [])

  // Nickname availability debounce
  useEffect(() => {
    if (!editingNickname) return
    if (nicknameValue.length < 3 || nicknameValue === nickname) { setNicknameCheck('idle'); return }
    setNicknameCheck('checking')
    const t = setTimeout(() => {
      fetch('/api/auth/session?checkNickname=' + encodeURIComponent(nicknameValue))
        .then(r => r.json()).then(d => setNicknameCheck(d.available ? 'available' : 'taken')).catch(() => setNicknameCheck('idle'))
    }, 600)
    return () => clearTimeout(t)
  }, [nicknameValue, nickname, editingNickname])

  useEffect(() => { if (editingNickname) setTimeout(() => nicknameInputRef.current?.focus(), 50) }, [editingNickname])

  function copyLink() {
    if (!referral) return
    navigator.clipboard.writeText(`${window.location.origin}/join/${referral.code}`)
    toast.success('Link copied!')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function removeBookmark(postId: string) {
    setBookmarks(prev => prev.filter(b => b.id !== postId))
    await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'remove' }) })
    toast('Removed from saved')
  }

  async function unblock(ghostId: string) {
    setBlocks(prev => prev.filter(b => b.blocked_ghost_id !== ghostId))
    await fetch('/api/blocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghostId, action: 'unblock' }) })
  }

  function toggleTheme() {
    const n = !dark; setDark(n)
    document.documentElement.setAttribute('data-theme', n ? 'dark' : 'light')
    localStorage.setItem('theme', n ? 'dark' : 'light')
  }

  async function deleteAccount() {
    setDeleting(true)
    await fetch('/api/auth/session', { method: 'DELETE' })
    window.location.href = '/'
  }

  async function saveNickname() {
    if (nicknameValue.length < 3 || nicknameValue === nickname || nicknameCheck === 'taken') return
    setNicknameSaving(true)
    const res = await fetch('/api/auth/session', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: nicknameValue }) })
    setNicknameSaving(false)
    if (res.ok) { setNickname(nicknameValue); setEditingNickname(false); toast.success('Nickname updated!') }
    else if (res.status === 409) setNicknameCheck('taken')
    else toast.error('Something went wrong')
  }

  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--bd)' }
  const rowLast: React.CSSProperties = { ...row, borderBottom: 'none' }

  if (loading) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>
      </div>
      <Footer />
    </main>
  )

  if (!data?.user) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)', fontSize: '.875rem' }}>Please <a href="/auth" style={{ color: 'var(--blue)' }}>sign in</a> to view your profile.</p>
      </div>
      <Footer />
    </main>
  )

  const { user, postCount, replyCount } = data
  const tl = user.trust_level || 'new'
  const trustBg: Record<string, string> = { new: 'var(--bg)', active: 'var(--blue-d)', trusted: 'var(--grn-d)', top: '#FFFBEB' }
  const trustFg: Record<string, string> = { new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706' }
  const trustBorder: Record<string, string> = { new: '1px solid var(--bd)', active: 'none', trusted: 'none', top: '1px solid rgba(217,119,6,.2)' }

  const canSaveNick = nicknameValue.length >= 3 && nicknameValue !== nickname && nicknameCheck !== 'taken' && !nicknameSaving

  const navItems: { key: Section; icon: React.ReactNode; label: string; danger?: boolean }[] = [
    { key: 'account', icon: <User size={14} />, label: 'Account' },
    { key: 'appearance', icon: <Palette size={14} />, label: 'Appearance' },
    { key: 'notifications', icon: <Bell size={14} />, label: 'Notifications' },
    { key: 'push', icon: <Smartphone size={14} />, label: 'Push' },
    { key: 'privacy', icon: <Shield size={14} />, label: 'Privacy' },
    { key: 'following', icon: <Users size={14} />, label: 'Following' },
    { key: 'danger', icon: <AlertTriangle size={14} />, label: 'Danger Zone', danger: true },
  ]

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ━━━ TOP CARD ━━━ */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {(nickname || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em', margin: 0 }}>{nickname}</h1>
            <span style={{ display: 'inline-block', marginTop: 4, fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 8px', borderRadius: 9999, color: trustFg[tl], background: trustBg[tl], border: trustBorder[tl] }}>{tl} member</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'POSTS', value: postCount || 0 },
              { label: 'REPLIES', value: replyCount || 0 },
              { label: 'REP', value: user.rep_score || 0 },
              { label: 'STREAK', value: `${user.current_streak || user.streak_days || 0}d` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 14px', textAlign: 'center', minWidth: 64 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)', display: 'block' }}>{s.value}</span>
                <span style={{ fontSize: '.58rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', display: 'block', marginTop: 2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ━━━ CONTENT TABS ━━━ */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 4 }}>
          {(['overview', 'saved', 'blocked'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '.8rem', fontWeight: 600,
              borderRadius: 'calc(var(--rm) - 4px)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === tab ? 'var(--blue)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--t3)', transition: 'all .15s',
            }}>{tab === 'overview' ? 'Overview' : tab === 'saved' ? 'Saved' : 'Blocked'}</button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'overview' && (
          data.posts && data.posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.posts.map((post: any) => (
                <a key={post.id} href={`/post/${post.id}`} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 14, cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {post.categories?.name && <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>{post.categories.name}</span>}
                    <span style={{ fontSize: '.68rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{post.ghost_id}</span>
                    <span style={{ fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', margin: '6px 0 4px' }}>{post.title}</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: '.72rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}><ArrowUp size={11} />{post.upvotes}</span>
                    <span style={{ fontSize: '.72rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={11} />{post.reply_count}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <User size={32} style={{ color: 'var(--t4)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>Your posts will appear here</p>
            </div>
          )
        )}

        {activeTab === 'saved' && (
          bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Bookmark size={32} style={{ color: 'var(--t4)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>No saved posts yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookmarks.map((post: any) => (
                <div key={post.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <a href={`/post/${post.id}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>{post.categories?.name}</span>
                      <span style={{ fontSize: '.68rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{post.ghost_id}</span>
                      <span style={{ fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', margin: '0 0 4px' }}>{post.title}</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: '.72rem', color: 'var(--t3)' }}>{post.upvotes} upvotes</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--t3)' }}>{post.reply_count} replies</span>
                    </div>
                  </a>
                  <button onClick={() => removeBookmark(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4, flexShrink: 0 }}><X size={14} /></button>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'blocked' && (
          blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <ShieldOff size={32} style={{ color: 'var(--t4)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>No blocked users</p>
            </div>
          ) : (
            <div>
              {blocks.map((b: any) => (
                <div key={b.blocked_ghost_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                  <Ghost size={12} style={{ color: 'var(--t4)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>{b.blocked_ghost_id}</span>
                  <button onClick={() => unblock(b.blocked_ghost_id)} style={{ color: 'var(--rose)', border: '1px solid rgba(225,29,72,.2)', background: 'var(--rose-d)', borderRadius: 'var(--rs)', fontSize: '.7rem', fontWeight: 500, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Unblock</button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ━━━ BADGES ━━━ */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={16} style={{ color: 'var(--blue)' }} />
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', flex: 1 }}>Badges</span>
            <span style={{ fontSize: '.75rem', color: 'var(--t4)' }}>{badges.length} earned</span>
          </div>
          {badges.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {badges.map((b: any) => (
                <div key={b.id} title={b.description} style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '6px 12px', fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{b.emoji}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>No badges yet — keep posting!</p>
          )}
        </div>

        {/* ━━━ REFERRAL ━━━ */}
        {referral && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Users size={16} style={{ color: 'var(--blue)' }} />
              <span style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)' }}>Referral</span>
              <span style={{ marginLeft: 'auto', fontSize: '.75rem', fontWeight: 600, color: 'var(--blue)' }}>{referral.count} people joined</span>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 12 }}>Share your link. You get +5 rep for each person who joins wiispr.</p>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 14px', gap: 10 }}>
              <span style={{ fontSize: '.8rem', fontFamily: 'monospace', color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/join/${referral.code}` : `/join/${referral.code}`}
              </span>
              <button onClick={copyLink} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t4)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={14} style={{ color: 'var(--grn)' }} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* ━━━ SETTINGS AREA ━━━ */}
        <div className="settings-area" style={{ display: 'flex', gap: 0, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden', minHeight: 480 }}>

          {/* LEFT SIDEBAR */}
          <div className="settings-sidebar" style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--bd)', padding: 8, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t4)', padding: '10px 10px 4px', display: 'block' }}>Settings</span>
            {navItems.map(item => (
              <button
                key={item.key}
                className="nav-item"
                onClick={() => setActiveSection(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, fontSize: '.8125rem',
                  fontWeight: activeSection === item.key ? 600 : 500,
                  color: item.danger && activeSection === item.key ? 'var(--rose)' : activeSection === item.key ? 'var(--blue)' : 'var(--t3)',
                  padding: '8px 10px', borderRadius: 'var(--r)', cursor: 'pointer', width: '100%',
                  border: 'none', fontFamily: 'inherit', textAlign: 'left', transition: 'all .12s',
                  background: activeSection === item.key ? (item.danger ? 'var(--rose-d)' : 'var(--blue-d)') : 'none',
                }}
              >{item.icon}{item.label}</button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

            {/* ACCOUNT */}
            {activeSection === 'account' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Account</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Manage your profile details.</p>

                {/* Nickname row */}
                {!editingNickname ? (
                  <div style={row}>
                    <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Nickname</p><p style={{ fontSize: '.72rem', color: 'var(--t3)', fontFamily: 'monospace', margin: '2px 0 0' }}>{nickname}</p></div>
                    <button onClick={() => { setNicknameValue(nickname); setEditingNickname(true); setNicknameCheck('idle') }} style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 16px', borderRadius: 9999, border: '1px solid var(--bd)', color: 'var(--t2)', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', padding: 14, margin: '4px 0', boxShadow: '0 0 0 3px rgba(79,70,229,.1)' }}>
                    <input ref={nicknameInputRef} value={nicknameValue} onChange={e => setNicknameValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))} maxLength={30}
                      style={{ width: '100%', height: 36, fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '0 12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div>
                        {nicknameValue.length > 0 && nicknameValue.length < 3 && <span style={{ fontSize: '.72rem', color: 'var(--rose)' }}>Min 3 characters</span>}
                        {nicknameCheck === 'checking' && <span style={{ fontSize: '.72rem', color: 'var(--t4)' }}>Checking…</span>}
                        {nicknameCheck === 'available' && <span style={{ fontSize: '.72rem', color: 'var(--grn)' }}>✓ Available</span>}
                        {nicknameCheck === 'taken' && <span style={{ fontSize: '.72rem', color: 'var(--rose)' }}>✗ Already taken</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditingNickname(false); setNicknameValue(nickname); setNicknameCheck('idle') }} style={{ fontSize: '.75rem', color: 'var(--t3)', background: 'none', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={saveNickname} disabled={!canSaveNick} style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--rs)', border: 'none', cursor: canSaveNick ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: canSaveNick ? 'var(--blue)' : 'var(--bd)', color: canSaveNick ? '#fff' : 'var(--t4)' }}>{nicknameSaving ? 'Saving…' : 'Save'}</button>
                      </div>
                    </div>
                  </div>
                )}

                <div style={row}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Age Range</p>
                  <select value={ageRange} onChange={async e => {
                    setAgeRange(e.target.value)
                    await fetch('/api/auth/session', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ageRange: e.target.value }) })
                    toast.success('Saved')
                  }} style={{ fontSize: '.8rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '5px 8px', color: 'var(--t1)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <option value="">Select...</option><option>15-17</option><option>18-23</option><option>24-30</option><option>31-40</option><option>41+</option>
                  </select>
                </div>
                <div style={row}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Gender</p>
                  <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{user.gender}</span>
                </div>
                <div style={row}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Trust Level</p>
                  <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 9999, color: trustFg[tl], background: trustBg[tl], border: trustBorder[tl] }}>{tl}</span>
                </div>
                <div style={rowLast}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Member since</p>
                  <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </>
            )}

            {/* APPEARANCE */}
            {activeSection === 'appearance' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Appearance</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Customize how wiispr looks.</p>
                <div style={row}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Theme</p>
                  <button onClick={toggleTheme} style={{ width: 76, height: 28, borderRadius: 14, background: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.06)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', padding: 2 }}>
                    <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ width: 34, height: 22, borderRadius: 11, background: dark ? 'rgba(255,255,255,.15)' : '#fff', position: 'absolute', left: dark ? 38 : 2, top: 2, boxShadow: '0 1px 4px rgba(0,0,0,.18)' }} />
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: !dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Light</span>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Dark</span>
                  </button>
                </div>
                <div style={rowLast}>
                  <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Language</p>
                  <select defaultValue={typeof window !== 'undefined' ? localStorage.getItem('wiispr_lang') || 'en' : 'en'} onChange={e => localStorage.setItem('wiispr_lang', e.target.value)} style={{ fontSize: '.8rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '5px 8px', color: 'var(--t1)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <option value="en">English</option><option value="ar">العربية</option>
                  </select>
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === 'notifications' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Notifications</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Choose what you get notified about.</p>
                {([
                  { key: 'follows' as const, label: 'New followers', desc: 'When someone follows your Ghost ID' },
                  { key: 'upvotes' as const, label: 'Upvotes', desc: 'When your post gets upvoted' },
                  { key: 'milestones' as const, label: 'Milestones', desc: 'When your post hits 10, 50, or 100 upvotes' },
                  { key: 'replies' as const, label: 'Replies', desc: 'When someone replies to your post' },
                ]).map((item, i, arr) => (
                  <div key={item.key} style={i === arr.length - 1 ? rowLast : row}>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: '.72rem', color: 'var(--t4)', margin: '2px 0 0' }}>{item.desc}</p>
                    </div>
                    <Switch checked={notifPrefs[item.key]} onCheckedChange={async v => {
                      const u = { ...notifPrefs, [item.key]: v }; setNotifPrefs(u)
                      await fetch('/api/notification-prefs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefs: u }) })
                      setNotifSaved(true); setTimeout(() => setNotifSaved(false), 1500)
                    }} />
                  </div>
                ))}
                {notifSaved && <span style={{ fontSize: '.7rem', color: 'var(--grn)', display: 'block', textAlign: 'right', marginTop: 8 }}>Saved ✓</span>}
              </>
            )}

            {/* PUSH */}
            {activeSection === 'push' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Push Notifications</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Get notified even when wiispr is closed.</p>
                {pushEnabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={16} style={{ color: 'var(--grn)' }} />
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--grn)' }}>Push notifications enabled</span>
                  </div>
                ) : (
                  <button onClick={async () => {
                    try {
                      const reg = await navigator.serviceWorker.register('/sw.js')
                      const permission = await Notification.requestPermission()
                      if (permission !== 'granted') { toast.error('Permission denied'); return }
                      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '' })
                      await fetch('/api/notifications/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON() }) })
                      setPushEnabled(true); toast.success('Push notifications enabled!')
                    } catch { toast.error('Could not enable notifications') }
                  }} style={{ background: 'var(--blue)', color: '#fff', fontSize: '.875rem', fontWeight: 600, padding: '10px 20px', borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Enable push notifications
                  </button>
                )}
              </>
            )}

            {/* PRIVACY */}
            {activeSection === 'privacy' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Privacy</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Your identity is always protected.</p>
                <div style={row}>
                  <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Ghost ID per post</p><p style={{ fontSize: '.72rem', color: 'var(--t4)', margin: '2px 0 0' }}>Changes with every post — always on</p></div>
                  <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--grn)', background: 'var(--grn-d)', padding: '2px 9px', borderRadius: 9999 }}>Always on</span>
                </div>
                <div style={row}>
                  <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>Email storage</p><p style={{ fontSize: '.72rem', color: 'var(--t4)', margin: '2px 0 0' }}>Your email is never stored in plain text</p></div>
                  <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--grn)', background: 'var(--grn-d)', padding: '2px 9px', borderRadius: 9999 }}>SHA-256 hashed</span>
                </div>
                <div style={rowLast}>
                  <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', margin: 0 }}>IP logging</p><p style={{ fontSize: '.72rem', color: 'var(--t4)', margin: '2px 0 0' }}>Auto-deleted after 90 days</p></div>
                  <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t3)', background: 'var(--bg)', border: '1px solid var(--bd)', padding: '2px 9px', borderRadius: 9999 }}>90 day TTL</span>
                </div>
                <button onClick={() => toast('Your data export will be sent to your email')} style={{ border: '1px solid var(--bd)', color: 'var(--t2)', background: 'none', padding: '7px 16px', borderRadius: 'var(--r)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>Export my data</button>
              </>
            )}

            {/* FOLLOWING */}
            {activeSection === 'following' && (() => {
              const filtered = follows.filter(g => g.toLowerCase().includes(followSearch.toLowerCase()))
              function catAccent(name: string) { return CATEGORY_COLORS[name?.toLowerCase()] || 'var(--blue)' }
              return (
                <>
                  <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.01em', marginBottom: 4 }}>Following</h2>
                  <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Manage who and what you follow.</p>

                  {/* Inner tab strip */}
                  <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 3, marginBottom: 16 }}>
                    {(['ghosts', 'categories'] as const).map(t => (
                      <button key={t} onClick={() => setFollowTab(t)} style={{
                        flex: 1, textAlign: 'center', padding: '5px 14px', fontSize: '.75rem', fontWeight: 600,
                        borderRadius: 'calc(var(--r) - 2px)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: followTab === t ? 'var(--sur)' : 'transparent',
                        color: followTab === t ? 'var(--t1)' : 'var(--t3)',
                        boxShadow: followTab === t ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                      }}>{t === 'ghosts' ? 'Ghost IDs' : 'Categories'}</button>
                    ))}
                  </div>

                  {/* GHOST IDs TAB */}
                  {followTab === 'ghosts' && (
                    <>
                      {/* Search bar */}
                      <div style={{ position: 'relative', marginBottom: 12 }}>
                        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
                        <input value={followSearch} onChange={e => setFollowSearch(e.target.value)} placeholder="Search followed ghosts…"
                          style={{ width: '100%', height: 34, paddingLeft: 32, paddingRight: followSearch ? 30 : 12, fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        {followSearch && (
                          <button onClick={() => setFollowSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', cursor: 'pointer', background: 'none', border: 'none', fontSize: '.75rem' }}><X size={12} /></button>
                        )}
                      </div>

                      <p style={{ fontSize: '.72rem', color: 'var(--t4)', marginBottom: 10 }}>{filtered.length} of {follows.length} ghost IDs</p>

                      {follows.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                          <Ghost size={28} style={{ color: 'var(--t4)', opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                          <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>You&apos;re not following anyone yet</p>
                        </div>
                      ) : filtered.length === 0 ? (
                        <p style={{ fontSize: '.8rem', color: 'var(--t4)', textAlign: 'center', padding: '20px 0' }}>No ghost IDs match your search</p>
                      ) : (
                        <AnimatePresence>
                          {filtered.map((ghostId, i) => (
                            <motion.div key={ghostId} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                              <Ghost size={12} style={{ color: 'var(--t4)', flexShrink: 0 }} />
                              <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>{ghostId}</span>
                              <button onClick={async () => {
                                setFollows(prev => prev.filter(f => f !== ghostId))
                                await fetch('/api/follows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghostId }) })
                              }} style={{ fontSize: '.7rem', fontWeight: 500, color: 'var(--rose)', border: '1px solid rgba(225,29,72,.2)', background: 'var(--rose-d)', borderRadius: 'var(--rs)', padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>Unfollow</button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </>
                  )}

                  {/* CATEGORIES TAB */}
                  {followTab === 'categories' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {categories.map((cat: any) => {
                          const isFollowed = followedCategories.includes(cat.id)
                          const accent = catAccent(cat.name)
                          return (
                            <div key={cat.id} onClick={async () => {
                              if (isFollowed) {
                                setFollowedCategories(prev => prev.filter(id => id !== cat.id))
                                toast('Unfollowed ' + cat.name)
                                await fetch('/api/follows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: cat.id }) })
                              } else {
                                setFollowedCategories(prev => [...prev, cat.id])
                                toast.success('Following ' + cat.name)
                                await fetch('/api/follows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: cat.id }) })
                              }
                            }} style={{
                              background: isFollowed ? accent + '12' : 'var(--bg)',
                              border: `1.5px solid ${isFollowed ? accent : 'var(--bd)'}`,
                              borderRadius: 'var(--r)', padding: '12px 14px',
                              display: 'flex', alignItems: 'center', gap: 10,
                              cursor: 'pointer', transition: 'all .15s',
                            }}>
                              <span style={{ color: accent, display: 'inline-flex', flexShrink: 0 }}><CategoryIcon slug={cat.icon || cat.slug} /></span>
                              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{cat.name}</span>
                              {isFollowed ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.65rem', fontWeight: 600, color: accent }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'inline-block' }} />
                                  Following
                                </span>
                              ) : (
                                <span style={{ fontSize: '.72rem', color: 'var(--t3)', fontWeight: 500 }}>+ Follow</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p style={{ fontSize: '.72rem', color: 'var(--t4)', textAlign: 'center', marginTop: 12 }}>{followedCategories.length} categories followed</p>
                    </>
                  )}
                </>
              )
            })()}

            {/* DANGER ZONE */}
            {activeSection === 'danger' && (
              <>
                <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--rose)', letterSpacing: '-.01em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} />Danger Zone</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>This is permanent. All your posts, replies, and data will be removed within 30 days.</p>
                <div style={{ background: 'rgba(225,29,72,.04)', border: '1px solid rgba(225,29,72,.2)', borderRadius: 'var(--r)', padding: 16 }}>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder='Type "delete my account" to confirm'
                    style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid rgba(225,29,72,.25)', borderRadius: 'var(--r)', padding: '9px 12px', outline: 'none', marginBottom: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  <button onClick={deleteAccount} disabled={deleteConfirm !== 'delete my account' || deleting} style={{
                    width: '100%', padding: 10, borderRadius: 'var(--r)', fontSize: '.875rem', fontWeight: 700,
                    border: 'none', fontFamily: 'inherit', transition: 'all .2s',
                    cursor: deleteConfirm === 'delete my account' ? 'pointer' : 'not-allowed',
                    background: deleteConfirm === 'delete my account' ? 'var(--rose)' : 'var(--bd)',
                    color: deleteConfirm === 'delete my account' ? '#fff' : 'var(--t4)',
                  }}>{deleting ? 'Deleting...' : 'Delete my account'}</button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  )
}
