import Nav from "@/components/Nav"
import UpvoteButton from "@/components/UpvoteButton"
import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import ReplyComposer from "@/components/ReplyComposer"

export const dynamic = "force-dynamic"

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: post } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .single()

  if (!post) return notFound()

  const { data: replies } = await supabase
    .from("replies")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px" }}>
        <a href="/" style={{ fontSize: ".8rem", color: "var(--blue)", display: "block", marginBottom: 16 }}>&larr; Back to feed</a>
        <div style={{ background: "var(--sur)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--blue)", background: "var(--blue-d)", padding: "2px 7px", borderRadius: 3 }}>{post.categories?.name}</span>
            <span style={{ fontFamily: "monospace", fontSize: ".7rem", color: "var(--t4)" }}>{post.ghost_id}</span>
            <span style={{ fontFamily: "monospace", fontSize: ".65rem", color: "var(--t4)", marginLeft: "auto" }}>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--t1)", marginBottom: 10, lineHeight: 1.35 }}>{post.title}</h1>
          {post.body && <p style={{ fontSize: ".9375rem", color: "var(--t2)", lineHeight: 1.8, marginBottom: 16 }}>{post.body}</p>}
          <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: "1px solid var(--bd)" }}>
          <UpvoteButton postId={post.id} upvotes={post.upvotes} />
            <span style={{ fontSize: ".75rem", color: "var(--t4)", padding: "5px 0" }}>{post.reply_count} replies</span>
          </div>
        </div>
        <ReplyComposer postId={post.id} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {replies && replies.length > 0 ? replies.map((reply: any) => (
            <div key={reply.id} style={{ background: "var(--sur)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: ".7rem", color: "var(--t4)" }}>{reply.ghost_id}</span>
                <span style={{ fontFamily: "monospace", fontSize: ".65rem", color: "var(--t4)", marginLeft: "auto" }}>{new Date(reply.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: ".875rem", color: "var(--t2)", lineHeight: 1.7 }}>{reply.body}</p>
            </div>
          )) : (
            <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--t4)", fontSize: ".875rem" }}>No replies yet. Be the first.</div>
          )}
        </div>
      </div>
    </main>
  )
}
