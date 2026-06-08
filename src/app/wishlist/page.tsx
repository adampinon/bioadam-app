'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useWishlist } from '@/hooks/useWishlist'
import WishlistItemCard from '@/components/WishlistItem'
import { Plus, ShoppingCart } from 'lucide-react'

export default function WishlistPage() {
  const [user, setUser] = useState<User | null>(null)
  const { items, loading, addItem, updateItem, deleteItem } = useWishlist(user?.id)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [link, setLink] = useState('')

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await addItem(name.trim(), link.trim())
    setName('')
    setLink('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Wishlist Santé</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
            required
            className="w-full rounded-lg bg-black px-3 py-2.5 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
            autoFocus
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Lien produit (URL)"
            type="url"
            className="w-full rounded-lg bg-black px-3 py-2.5 text-sm text-zinc-300 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white">
              Ajouter
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-900" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart size={40} className="text-zinc-800" />
          <p className="mt-3 text-sm text-zinc-600">Wishlist vide</p>
          <p className="text-xs text-zinc-700">Ajoute des produits à tester ou acheter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
