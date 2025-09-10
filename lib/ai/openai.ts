export async function callOpenAIJSON(messages: any[], opts?: { model?: string, maxTokens?: number, temperature?: number }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const model = opts?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.3,
      response_format: { type: 'json_object' },
      max_tokens: opts?.maxTokens ?? 800,
    })
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`OpenAI error: ${resp.status} ${text}`)
  }
  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content
  try {
    return JSON.parse(content)
  } catch {
    return {}
  }
}

