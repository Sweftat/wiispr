import Nav from '@/components/Nav'
import Compose from '@/components/Compose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  const { data: posts } = await supabase.from('posts').select('*, categories(name, slug)').eq('is_deleted', false).eq('is_blurred', false).order('created_at', { ascending: false }).limit(20)

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
          <div>
            <Compose categories={categories || []} />
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {["All","Hot","New","Following"].map(f => (
                <button key={f} style={{ fontSize: ".8rem", fontWeight: 600, padding: "6px 14px", borderRadius: "var(--rs)", border: "1px solid var(--bd)", background: f==="All" ? "#18181B" : "var(--sur)", color: f==="All" ? "#fff" : "var(--t3)", cursor: "pointer" }}>{f}</button>
              ))}
            </div>
            {posts && posts.length > 0 ? posts.map((post: any) => (
              <a key={post.id} href={`/post/${post.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 10 }}><div style={{ background: "var(--sur)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", padding: "16px 18px", cursor: 'pointer' }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--blue)", background: "var(--blue-d)", padding: "2px 7px", borderRadius: 3 }}>{post.categories?.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: ".7rem", color: "var(--t4)" }}>{post.ghost_id}</span>
                  <span style={{ fontFamily: "monospace", fontSize: ".65rem", color: "var(--t4)", marginLeft: "auto" }}>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>{post.title}</h2>
                {post.body && <p style={{ fontSize: ".875rem", color: "var(--t2)", lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
                <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid var(--bd)" }}>
                  <button style={{ fontSize: ".75rem", fontWeight: 600, padding: "5px 10px", borderRadius: "var(--rs)", border: "1px solid var(--bd)", background: "none", color: "var(--t3)" }}>up {post.upvotes}</button>
                  <button style={{ fontSize: ".75rem", fontWeight: 600, padding: "5px 10px", borderRadius: "var(--rs)", border: "1px solid var(--bd)", background: "none", color: "var(--t3)" }}>{post.reply_count} replies</button>
                </div>
              </div></a>
            )) : (
              <div style={{ background: "var(--sur)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", marginBottom: 12 }}>💬</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>Nothing here yet</p>
                <p style={{ fontSize: ".875rem", color: "var(--t3)" }}>Be the first to whisper.</p>
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: ".625rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t4)", marginBottom: 10 }}>Categories</p>
            <div style={{ background: "var(--sur)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", overflow: "hidden" }}>
              {categories?.map((cat: any, i: number) => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < categories.length-1 ? "1px solid var(--bd)" : "none", cursor: "pointer" }}>
                  <span>{cat.icon}</span>
                  <span style={{ fontSize: ".8375rem", color: "var(--t2)", fontWeight: 500 }}>{cat.name}</span>
                  {cat.women_only && <span style={{ marginLeft: "auto", fontSize: ".55rem", fontWeight: 700, color: "var(--rose)", background: "var(--rose-d)", padding: "1px 5px", borderRadius: 3 }}>Women</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
