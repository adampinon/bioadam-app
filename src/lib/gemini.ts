const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!

const MODEL = 'gemini-2.5-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

export async function sendGeminiMessage(
  contents: { role: 'user' | 'assistant'; content: string }[],
  profileContext: string,
  memoriesContext: string
): Promise<string> {
  const systemPrompt = `Tu es l'assistant de BioAdam, un pote expert en biohacking et en longévité. Tu dois obligatoirement TUTOYER l'utilisateur. Ton ton est direct, amical, transparent et ultra-scientifique. Tu l'aides à optimiser sa santé et à fuir les biais des lobbies industriels en te basant sur son profil et ses souvenirs.

Profil de l'utilisateur :
${profileContext}

Souvenirs / faits clés :
${memoriesContext}`

  const geminiContents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...contents.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  ]

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: geminiContents }),
  })

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer de réponse.'
  return text
}

export async function sendGeminiVisionMessage(
  contents: { role: 'user' | 'assistant'; content: string }[],
  imageBase64: string,
  mimeType: string,
  profileContext: string,
  memoriesContext: string
): Promise<string> {
  const systemPrompt = `Tu es l'assistant de BioAdam, un pote expert en biohacking et en longévité. Tu dois obligatoirement TUTOYER l'utilisateur. Ton ton est direct, amical, transparent et ultra-scientifique. Tu l'aides à optimiser sa santé et à fuir les biais des lobbies industriels en te basant sur son profil et ses souvenirs.

Profil de l'utilisateur :
${profileContext}

Souvenirs / faits clés :
${memoriesContext}`

  const lastUserMsg = contents[contents.length - 1]?.content || 'Analyse cette image.'
  const history = contents.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const geminiContents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...history,
    {
      role: 'user',
      parts: [
        { text: lastUserMsg },
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64,
          },
        },
      ],
    },
  ]

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: geminiContents }),
  })

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu analyser cette image.'
  return text
}
