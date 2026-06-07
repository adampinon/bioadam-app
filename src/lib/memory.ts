import { getSupabase } from './supabase'

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
const MODEL = 'gemini-2.5-flash'
const EXTRACT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

export async function extractAndStoreMemory(
  userId: string,
  userMessage: string
): Promise<void> {
  try {
    const prompt = `Analyse le message d'un utilisateur de BioAdam (assistant biohacking). Si le message contient une information clé (nouvel achat, nouvelle habitude, test de produit, préférence, symptôme, etc.), réponds UNIQUEMENT avec un objet JSON valide : {"category": "achat|habitude|test|preference|symptome|general", "fact": "le fait court en français"}. Si aucune info clé n'est détectée, réponds UNIQUEMENT par "null". Ne réponds rien d'autre. Message: "${userMessage}"`

    const res = await fetch(EXTRACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    })

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'null'

    if (text === 'null') return

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    if (parsed && parsed.fact) {
      await getSupabase().from('user_memories').insert({
        user_id: userId,
        category: parsed.category || 'general',
        content: parsed.fact,
      } as never)
    }
  } catch {
    console.warn('Memory extraction skipped')
  }
}
