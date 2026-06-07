'use client'

import { Edit3, Save } from 'lucide-react'
import { useState } from 'react'
import { Profile } from '@/types'

interface ProfileCardProps {
  profile: Profile | null
  onSave: (philosophy: string, routines: string) => Promise<void>
}

export default function ProfileCard({ profile, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false)
  const [philosophy, setPhilosophy] = useState(profile?.general_philosophy || '')
  const [routines, setRoutines] = useState(profile?.routines || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(philosophy, routines)
    setEditing(false)
    setSaving(false)
  }

  const handleEdit = () => {
    setPhilosophy(profile?.general_philosophy || '')
    setRoutines(profile?.routines || '')
    setEditing(true)
  }

  if (!editing) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Mon Profil</h2>
          <button onClick={handleEdit} className="text-emerald-400 transition-colors hover:text-emerald-300">
            <Edit3 size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Philosophie</p>
            <p className="text-sm text-zinc-300">{profile?.general_philosophy || 'Pas encore définie'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Routines</p>
            <p className="text-sm text-zinc-300">{profile?.routines || 'Pas encore définies'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Mon Profil</h2>
        <button onClick={handleSave} disabled={saving} className="text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40">
          {saving ? <span className="text-xs">...</span> : <Save size={16} />}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Philosophie</p>
          <textarea
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
            className="w-full rounded-lg bg-black px-3 py-2 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
            rows={2}
            placeholder="Ta philosophie de santé..."
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Routines</p>
          <textarea
            value={routines}
            onChange={(e) => setRoutines(e.target.value)}
            className="w-full rounded-lg bg-black px-3 py-2 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
            rows={3}
            placeholder="Tes routines actuelles..."
          />
        </div>
      </div>
    </div>
  )
}
