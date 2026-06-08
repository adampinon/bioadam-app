'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Camera, MessageSquare, Heart } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyses', label: 'Analyses', icon: Camera },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
                active ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
