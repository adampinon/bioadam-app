'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { WishlistItem } from '@/types'

export function useWishlist(userId: string | undefined) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId])

  const load = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await getSupabase()
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setItems((data as WishlistItem[]) || [])
    setLoading(false)
  }

  const addItem = async (productName: string, notes?: string) => {
    if (!userId) return
    await getSupabase()
      .from('wishlist')
      .insert({ user_id: userId, product_name: productName, notes: notes || '' } as never)
    await load()
  }

  const updateItem = async (id: string, productName: string, notes: string) => {
    await getSupabase()
      .from('wishlist')
      .update({ product_name: productName, notes } as never)
      .eq('id', id)
    await load()
  }

  const deleteItem = async (id: string) => {
    await getSupabase().from('wishlist').delete().eq('id', id)
    await load()
  }

  return { items, loading, addItem, updateItem, deleteItem }
}
