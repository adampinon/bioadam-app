'use client'

import { Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { fileToBase64 } from '@/lib/file'

interface CameraButtonProps {
  onImage: (base64: string, mimeType: string) => void
}

export default function CameraButton({ onImage }: CameraButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const { base64, mime } = await fileToBase64(file)
    onImage(base64, mime)
    setLoading(false)
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95 hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Camera size={22} />
        )}
        Analyser un produit
      </button>
    </>
  )
}
