'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { UserMemory } from '@/types'
import { useMessages } from '@/hooks/useChat'
import { useProfile } from '@/hooks/useProfile'
import { sendGeminiMessage, sendGeminiVisionMessage } from '@/lib/gemini'
import { extractAndStoreMemory } from '@/lib/memory'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { ArrowLeft } from 'lucide-react'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const chatId = id

  const [user, setUser] = useState<User | null>(null)
  const { messages, loading, addMessage } = useMessages(chatId)
  const { profile } = useProfile(user?.id)
  const [memoriesText, setMemoriesText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const initialProcessed = useRef(false)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    if (!user) return
    getSupabase()
      .from('user_memories')
      .select('content')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const memories = data as unknown as Pick<UserMemory, 'content'>[] | null
        setMemoriesText(memories?.map((m) => `- ${m.content}`).join('\n') || 'Aucun souvenir pour le moment.')
      })
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string, imageBase64?: string, mimeType?: string) => {
    if (!chatId || !user) return

    const userContent = text || (imageBase64 ? '[Image analysée]' : '')
    await addMessage('user', userContent)

    const profileContext = profile
      ? `Philosophie: ${profile.general_philosophy || 'Non définie'}\nRoutines: ${profile.routines || 'Non définies'}`
      : 'Profil non renseigné'

    setStreaming(true)

    try {
      const allMsgs = [...messages, { id: '', chat_id: chatId, role: 'user' as const, content: userContent, created_at: '' }]
      const geminiMsgs = allMsgs.map((m) => ({ role: m.role, content: m.content }))

      let responseText: string
      if (imageBase64 && mimeType) {
        responseText = await sendGeminiVisionMessage(geminiMsgs, imageBase64, mimeType, profileContext, memoriesText)
      } else {
        responseText = await sendGeminiMessage(geminiMsgs, profileContext, memoriesText)
      }

      await addMessage('assistant', responseText)

      extractAndStoreMemory(user.id, userContent)
    } catch {
      await addMessage('assistant', 'Désolé, j\'ai eu un souci technique. Réessaie !')
    }

    setStreaming(false)
  }

  // Auto-send initial image from camera (via sessionStorage)
  useEffect(() => {
    if (initialProcessed.current || loading || messages.length > 0 || !user) return
    initialProcessed.current = true
    const pendingImage = sessionStorage.getItem('pendingImage')
    const pendingMime = sessionStorage.getItem('pendingImageMime')
    if (pendingImage && pendingMime) {
      sessionStorage.removeItem('pendingImage')
      sessionStorage.removeItem('pendingImageMime')
      handleSend('', pendingImage, pendingMime)
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-sm text-zinc-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={() => router.push('/chat')} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-900">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-medium text-white truncate">Conversation</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-zinc-600">Envoie un message pour commencer</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {streaming && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
              <span className="text-xs text-white">B</span>
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-900 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  )
}
