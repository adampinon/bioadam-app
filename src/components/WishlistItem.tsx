'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { WishlistItem } from '@/types'

interface WishlistItemProps {
  item: WishlistItem
  onUpdate: (id: string, productName: string, notes: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function WishlistItemCard({ item, onUpdate, onDelete }: WishlistItemProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.product_name)
  const [notes, setNotes] = useState(item.notes)

  const handleSave = async () => {
    await onUpdate(item.id, name, notes)
    setEditing(false)
  }

  const handleCancel = () => {
    setName(item.product_name)
    setNotes(item.notes)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded-lg bg-black px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
          placeholder="Nom du produit"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-zinc-300 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
          rows={2}
          placeholder="Notes..."
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white">
            <Check size={14} />
            Sauver
          </button>
          <button onClick={handleCancel} className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400">
            <X size={14} />
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{item.product_name}</h3>
          {item.notes && <p className="mt-1 text-xs text-zinc-400">{item.notes}</p>}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-400">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(item.id)} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
