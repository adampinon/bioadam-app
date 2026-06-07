'use client'

import { useState, useRef } from 'react'
import { Send, ImagePlus, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string, imageBase64?: string, mimeType?: string) => Promise<void>
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<{ base64: string; mime: string } | null>(null)
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if ((!text.trim() && !image) || sending || disabled) return
    setSending(true)
    await onSend(text, image?.base64, image?.mime)
    setText('')
    setImage(null)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const mime = file.type
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    setImage({ base64, mime })
  }

  return (
    <div className="border-t border-zinc-800 bg-black p-3">
      {image && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-zinc-900 p-2">
          <span className="flex-1 truncate text-sm text-zinc-400">Image jointe</span>
          <button onClick={() => setImage(null)} className="text-xs text-red-400">Retirer</button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImagePick}
        />
        <div className="flex-1 rounded-2xl bg-zinc-900 px-4 py-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question..."
            rows={1}
            className="max-h-32 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !image) || sending || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
