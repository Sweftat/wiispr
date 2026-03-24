'use client'
import { useEffect, useState } from 'react'
import { Home, Search, Flame, Bell, User } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (d.user) {
        setLoggedIn(true)
        fetch('/api/notifications').then(r => r.json()).then(n => setUnread(n.unread || 0))
      }
    })
  }, [])

  const items = [
    { href: '/',              icon: Home,   label: 'Home' },
    { href: '/search',        icon: Search, label: 'Search' },
    { href: '/trending',      icon: Flame,  label: 'Trending' },
    { href: loggedIn ? '/notifications' : '/auth', icon: Bell, label: 'Alerts', badge: unread },
    { href: loggedIn ? '/profile' : '/auth', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--sur)', borderTop: '1px solid var(--bd)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch', height: 56 }}>
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                color: active ? 'var(--blue)' : 'var(--t4)',
                textDecoration: 'none', position: 'relative',
                fontSize: '.6rem', fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: 8, left: '50%', marginLeft: 4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--rose)', color: '#fff',
                  fontSize: '.5rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
