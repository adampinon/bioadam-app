'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import './globals.css'

const publicPaths = ['/auth']

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user && !publicPaths.includes(pathname)) {
      router.replace('/auth')
    }
    if (user && pathname === '/auth') {
      router.replace('/')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <html lang="fr">
        <body className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-pulse text-emerald-400 text-sm">BioAdam</div>
        </body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <title>BioAdam</title>
      </head>
      <body className="bg-black text-zinc-200">
        <main className="mx-auto min-h-screen max-w-lg">
          {user && <BottomNav />}
          <div className="px-4 pt-4 pb-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
