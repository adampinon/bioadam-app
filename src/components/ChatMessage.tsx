'use client'

import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isBot = role === 'assistant'

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isBot ? 'bg-emerald-600' : 'bg-zinc-700'
        }`}
      >
        {isBot ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isBot ? 'rounded-tl-sm bg-zinc-900 text-zinc-200' : 'rounded-tr-sm bg-emerald-900/40 text-emerald-100'
        }`}
      >
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}
