'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function AdminFlagged({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)

  async function dismissPost(postId: string) {
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'unblur' })
    })
    setPosts(posts.filter(p => p.id !== postId))
  }

  async function deletePost(postId: string) {
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'delete' })
    })
    setPosts(posts.filter(p => p.id !== postId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flagged Posts</h1>
        <p className="text-sm text-muted-foreground mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} awaiting review.</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle size={40} className="text-green-500 mb-4" />
            <p className="text-base font-bold text-foreground mb-1">All clear</p>
            <p className="text-sm text-muted-foreground">No flagged posts right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{post.categories?.name}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{post.ghost_id}</span>
                  <Badge variant="destructive" className="ml-auto text-[10px]">{post.reports?.length || 0} reports</Badge>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2">{post.title}</h3>
                {post.body && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.body}</p>}

                {post.reports && post.reports.length > 0 && (
                  <div className="bg-muted rounded-lg p-3 mb-4 space-y-1">
                    {post.reports.map((r: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        <span className="font-mono text-muted-foreground/60">#{i + 1}</span> {r.reason}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => dismissPost(post.id)} className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                    Dismiss — keep post
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>
                    Delete post
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}