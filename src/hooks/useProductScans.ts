'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { ProductScan } from '@/types'

export function useProductScans(userId: string | undefined) {
  const [scans, setScans] = useState<ProductScan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId])

  const load = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await getSupabase()
      .from('product_scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setScans((data as ProductScan[]) || [])
    setLoading(false)
  }

  const addScan = async (scan: {
    product_name: string
    image_base64: string
    image_mime: string
    verdict: 'validated' | 'rejected'
    summary: string
    full_analysis: string
  }) => {
    if (!userId) return null
    const { data } = await getSupabase()
      .from('product_scans')
      .insert({ user_id: userId, ...scan } as never)
      .select()
      .single()
    if (data) setScans((prev) => [data as ProductScan, ...prev])
    return data as ProductScan | null
  }

  const deleteScan = async (id: string) => {
    await getSupabase().from('product_scans').delete().eq('id', id)
    setScans((prev) => prev.filter((s) => s.id !== id))
  }

  return { scans, loading, addScan, deleteScan, refresh: load }
}
