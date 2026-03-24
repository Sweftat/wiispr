'use client'
import { useState } from 'react'
import { timeAgo } from '@/lib/time'
import { ArrowUp, MessageCircle, Ghost, Flame, ShieldAlert } from 'lucide-react'
import PostPanel from './PostPanel'
import FollowButton from './FollowButton'

export default function TrendingFeed({ initialPosts }: { initialPosts: any[] }) {
  const [selectedPost, setSelectedPost] = useState<any>(null)

  if (initialPosts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t4)', fontSize: '.875rem' }}>
        No trending posts yet. Be the first to post something!
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {initialPosts.map((post, i) => (
          <TrendingPostCard key={post.id} post={post} rank={i + 1} onOpen={() => setSelectedPost(post)} />
        ))}
      </div>
      {selectedPost && <PostPanel post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  )
}

function TrendingPostCard({ post, rank, onOpen }: { post: any, rank: number, onOpen: () => void }) {
  const [revealed, setRevealed] = useState(false)

  const rankColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#9CA3AF' : rank === 3 ? '#CD7C54' : 'var(--t4)'

  return (
    <div
      className="post-card"
      onClick={() => post.content_warning && !revealed ? undefined : onOpen()}
      style={{
        background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)',
        padding: '14px 16px', cursor: 'pointer', transition: 'all .15s',
        display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', overflow: 'hidden',
      }}
    >
      {post.content_warning && !revealed && (
        <div
          onClick={e => { e.stopPropagation(); setRevealed(true) }}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 'var(--rm)', cursor: 'pointer',
          }}
        >
          <ShieldAlert size={22} style={{ color: '#FDE68A' }} />
          <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff' }}>⚠ {post.content_warning}</p>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.7)' }}>Click to reveal</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 32, paddingTop: 2 }}>
        <span style={{ fontSize: rank <= 3 ? '.875rem' : '.75rem', fontWeight: 800, color: rankColor, fontFamily: 'monospace' }}>#{rank}</span>
        {rank <= 3 && <Flame size={12} style={{ color: rankColor }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
          <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Ghost size={10} />{post.ghost_id}
          </span>
          <span onClick={e => e.stopPropagation()}>
            <FollowButton ghostId={post.ghost_id} />
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
        </div>
        <h2 className="auto-dir" style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 5, lineHeight: 1.4 }}>{post.title}</h2>
        {post.body && (
          <p className="auto-dir" style={{ fontSize: '.8125rem', color: 'var(--t3)', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.body}
          </p>
        )}
        <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid var(--bd)', alignItems: 'center' }}>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUp size={12} />{post.upvotes || 0}
          </span>
          <span style={{ fontSize: '.75rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageCircle size={11} />{post.reply_count || 0}
          </span>
        </div>
      </div>
    </div>
  )
}
