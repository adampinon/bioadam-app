'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useProductScans } from '@/hooks/useProductScans'
import { useProfile } from '@/hooks/useProfile'
import { analyzeProductImage } from '@/lib/gemini'
import { fileToBase64 } from '@/lib/file'
import { ProductScan } from '@/types'
import { Camera, Loader2, Scan, X, ChevronRight, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function AnalysesPage() {
  const [user, setUser] = useState<User | null>(null)
  const { scans, loading, addScan, deleteScan } = useProductScans(user?.id)
  const { profile } = useProfile(user?.id)
  const [scanning, setScanning] = useState(false)
  const [selected, setSelected] = useState<ProductScan | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setScanning(true)

    try {
      const { base64, mime } = await fileToBase64(file)
      const profileContext = profile
        ? `Philosophie: ${profile.general_philosophy || 'Non définie'}\nRoutines: ${profile.routines || 'Non définies'}`
        : 'Profil non renseigné'

      const result = await analyzeProductImage(base64, mime, profileContext)
      await addScan({
        product_name: result.product_name,
        image_base64: base64,
        image_mime: mime,
        verdict: result.verdict,
        summary: result.summary,
        full_analysis: result.full_analysis,
      })
    } catch {
      console.error('Scan failed')
    }

    setScanning(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Supprimer l'analyse de "${name}" ?`)) {
      deleteScan(id)
      if (selected?.id === id) setSelected(null)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleScan}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white">Analyses</h1>
      </div>

      {/* Scan history */}
      <div className="flex-1 space-y-3 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Scan size={40} className="text-zinc-800" />
            <p className="mt-3 text-sm text-zinc-600">Aucune analyse</p>
            <p className="text-xs text-zinc-700">Scanne un produit pour commencer</p>
          </div>
        ) : (
          scans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => setSelected(scan)}
              className="w-full max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 text-left transition-colors hover:border-zinc-700"
            >
              <div className="flex gap-3 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                  <img
                    src={`data:${scan.image_mime};base64,${scan.image_base64}`}
                    alt={scan.product_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-medium text-white">{scan.product_name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        scan.verdict === 'validated'
                          ? 'bg-emerald-900/60 text-emerald-400'
                          : 'bg-red-900/60 text-red-400'
                      }`}
                    >
                      {scan.verdict === 'validated' ? 'Validé' : 'Rejeté'}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={10} />
                    {formatDate(scan.created_at)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{scan.summary}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <ChevronRight size={16} className="text-zinc-600" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Sticky scan button */}
      <div className="sticky bottom-0 -mx-4 bg-black px-4 pb-2 pt-4">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95 hover:bg-emerald-500 disabled:opacity-60"
        >
          {scanning ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Camera size={22} />
          )}
          Scanner / Analyser un nouveau produit
        </button>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Analyse détaillée</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl bg-zinc-900">
              <img
                src={`data:${selected.image_mime};base64,${selected.image_base64}`}
                alt={selected.product_name}
                className="w-full object-cover"
                style={{ maxHeight: '200px' }}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">{selected.product_name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    selected.verdict === 'validated'
                      ? 'bg-emerald-900/60 text-emerald-400'
                      : 'bg-red-900/60 text-red-400'
                  }`}
                >
                  {selected.verdict === 'validated' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                  {selected.verdict === 'validated' ? 'Produit validé' : 'Produit rejeté'}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(selected.created_at)}</span>
              </div>
            </div>

            <div className="mb-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Résumé</p>
              <p className="text-sm text-zinc-300">{selected.summary}</p>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Analyse scientifique</p>
              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{selected.full_analysis}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(selected.id, selected.product_name)}
              className="w-full rounded-xl border border-red-900/50 py-3 text-sm text-red-400 transition-colors hover:bg-red-950"
            >
              Supprimer cette analyse
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
