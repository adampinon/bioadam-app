'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Chat, Message } from '@/types'

export function useChats(userId: string | undefined) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId])

  const load = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await getSupabase()
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setChats((data as Chat[]) || [])
    setLoading(false)
  }

  const createChat = async (title?: string): Promise<Chat | null> => {
    if (!userId) return null
    const { data } = await getSupabase()
      .from('chats')
      .insert({ user_id: userId, title: title || 'Nouvelle conversation' } as never)
      .select()
      .single()
    if (data) setChats((prev) => [data as Chat, ...prev])
    return data as Chat | null
  }

  const deleteChat = async (id: string) => {
    await getSupabase().from('chats').delete().eq('id', id)
    setChats((prev) => prev.filter((c) => c.id !== id))
  }

  const renameChat = async (id: string, title: string) => {
    await getSupabase().from('chats').update({ title } as never).eq('id', id)
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
  }

  return { chats, loading, createChat, deleteChat, renameChat, refresh: load }
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chatId) return
    load()
  }, [chatId])

  const load = async () => {
    if (!chatId) { setLoading(false); return }
    setLoading(true)
    const { data } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    setMessages((data as Message[]) || [])
    setLoading(false)
  }

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!chatId) return null
    const { data } = await getSupabase()
      .from('messages')
      .insert({ chat_id: chatId, role, content } as never)
      .select()
      .single()
    if (data) setMessages((prev) => [...prev, data as Message])
    return data as Message | null
  }, [chatId])

  return { messages, loading, addMessage, refresh: load }
}
