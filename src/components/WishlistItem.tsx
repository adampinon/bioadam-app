'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X, ExternalLink } from 'lucide-react'
import { WishlistItem } from '@/types'

interface WishlistItemProps {
  item: WishlistItem
  onUpdate: (id: string, productName: string, notes: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function WishlistItemCard({ item, onUpdate, onDelete }: WishlistItemProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.product_name)
  const [link, setLink] = useState(item.notes)
  const isValidUrl = item.notes && (item.notes.startsWith('http://') || item.notes.startsWith('https://'))

  const handleSave = async () => {
    await onUpdate(item.id, name, link)
    setEditing(false)
  }

  const handleCancel = () => {
    setName(item.product_name)
    setLink(item.notes)
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Supprimer "${item.product_name}" de la wishlist ?`)) {
      onDelete(item.id)
    }
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
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="mb-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-zinc-300 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
          placeholder="Lien produit (URL)"
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
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          {isValidUrl ? (
            <a
              href={item.notes}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="break-words text-sm font-medium text-white transition-colors hover:text-emerald-400">{item.product_name}</h3>
              <p className="mt-0.5 flex items-center gap-1 break-all text-xs text-emerald-400">
                <ExternalLink size={12} />
                {item.notes}
              </p>
            </a>
          ) : (
            <>
              <h3 className="break-words text-sm font-medium text-white">{item.product_name}</h3>
              {item.notes && <p className="mt-0.5 break-all text-xs text-zinc-400">{item.notes}</p>}
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-400">
            <Pencil size={14} />
          </button>
          <button onClick={handleDelete} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
