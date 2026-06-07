'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useProfile } from '@/hooks/useProfile'
import ProfileCard from '@/components/ProfileCard'
import CameraButton from '@/components/CameraButton'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { profile, loading, save } = useProfile(user?.id)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleImage = (base64: string, mimeType: string) => {
    router.push(`/chat?image=${encodeURIComponent(base64)}&mime=${encodeURIComponent(mimeType)}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">BioAdam</h1>
          <p className="text-xs text-zinc-500">Ton assistant longévité</p>
        </div>
        <button
          onClick={() => {
            getSupabase().auth.signOut()
            router.push('/auth')
          }}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800"
        >
          Déconnexion
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-2xl bg-zinc-900" />
          <div className="h-16 rounded-2xl bg-zinc-900" />
        </div>
      ) : (
        <>
          <ProfileCard profile={profile} onSave={save} />
          <CameraButton onImage={handleImage} />
        </>
      )}
    </div>
  )
}
