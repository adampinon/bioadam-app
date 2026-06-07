'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LogIn, UserPlus } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabase()
    const { error: err } = await (isSignUp
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password }))

    if (err) {
      setError(err.message)
    } else if (!isSignUp) {
      router.push('/')
    } else {
      setError('Compte créé ! Vérifie ton email pour confirmer.')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-400">BioAdam</h1>
        <p className="mt-1 text-sm text-zinc-500">Ton pote biohacking</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white outline-none ring-1 ring-zinc-800 focus:ring-emerald-500"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            minLength={6}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white outline-none ring-1 ring-zinc-800 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? (
            '...'
          ) : isSignUp ? (
            <>
              <UserPlus size={18} />
              Créer un compte
            </>
          ) : (
            <>
              <LogIn size={18} />
              Se connecter
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-xs text-zinc-500 underline"
        >
          {isSignUp ? 'Déjà un compte ? Connecte-toi' : "Pas de compte ? Crées-en un"}
        </button>
      </form>
    </div>
  )
}
