'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useChats } from '@/hooks/useChat'
import { Plus, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react'

export default function ChatHubPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { chats, loading, createChat, deleteChat, renameChat } = useChats(user?.id)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // Redirect to new chat with pending image from camera
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingImage')
    const pendingMime = sessionStorage.getItem('pendingImageMime')
    if (!pending || !pendingMime) return
    ;(async () => {
      const chat = await createChat()
      if (chat) router.push(`/chat/${chat.id}`)
    })()
  }, [user])

  const handleNew = async () => {
    const chat = await createChat()
    if (chat) router.push(`/chat/${chat.id}`)
  }

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id)
    setRenameValue(currentTitle)
  }

  const confirmRename = async (id: string) => {
    await renameChat(id, renameValue)
    setRenamingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Chat</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Plus size={18} />
          Nouveau
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-900" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={40} className="text-zinc-800" />
          <p className="mt-3 text-sm text-zinc-600">Aucune conversation</p>
          <p className="text-xs text-zinc-700">Clique sur Nouveau pour commencer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group flex w-full max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700"
            >
              <button
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                {renamingId === chat.id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full rounded-lg bg-black px-2 py-1 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-white">{chat.title}</p>
                    <p className="text-xs text-zinc-600">
                      {new Date(chat.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </>
                )}
              </button>

              {renamingId === chat.id ? (
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => confirmRename(chat.id)} className="rounded-lg p-1.5 text-emerald-400 hover:bg-zinc-800">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setRenamingId(null)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => startRename(chat.id, chat.title)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => { if (window.confirm('Supprimer cette conversation ?')) deleteChat(chat.id) }} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
