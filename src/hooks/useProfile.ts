'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Profile } from '@/types'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId])

  const load = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    setProfile(data as Profile | null)
    setLoading(false)
  }

  const save = async (philosophy: string, routines: string) => {
    if (!userId) return
    const payload = { user_id: userId, general_philosophy: philosophy, routines }
    if (profile) {
      await getSupabase().from('profiles').update(payload as never).eq('id', profile.id)
    } else {
      await getSupabase().from('profiles').insert(payload as never)
    }
    await load()
  }

  return { profile, loading, save }
}
