// Placeholder AI layer — swap askAI() body for a real API call when ready.
// context: { mode, compound, atom, reaction }

export async function askAI(message, context) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800))

  // TODO: replace with real API call, e.g.:
  // const res = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: { 'x-api-key': YOUR_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
  //   body: JSON.stringify({ model: 'claude-opus-4-8', max_tokens: 1024,
  //     system: buildSystemPrompt(context), messages: [{ role: 'user', content: message }] })
  // })
  // const data = await res.json()
  // return data.content[0].text

  return buildPlaceholderResponse(message, context)
}

function buildSystemPrompt(context) {
  let ctx = 'You are ChemScape AI, a friendly chemistry tutor built into the ChemScape app.'
  if (context.mode === 'compound' && context.compound) {
    ctx += ` The user is currently viewing the compound "${context.compound}".`
  } else if (context.mode === 'atom' && context.atom) {
    ctx += ` The user is currently viewing the element "${context.atom}".`
  } else if (context.mode === 'reaction' && context.reaction) {
    ctx += ` The user is currently viewing the reaction: "${context.reaction}".`
  }
  ctx += ' Answer clearly and concisely. Use plain text — no markdown.'
  return ctx
}

function buildPlaceholderResponse(message, context) {
  const lower = message.toLowerCase()

  if (context.mode === 'compound' && context.compound) {
    return `I can see you're looking at ${context.compound}! Once the AI is connected, I'll be able to answer questions about its structure, properties, uses, and more. For now this is a placeholder response.`
  }
  if (context.mode === 'atom' && context.atom) {
    return `Great question about ${context.atom}! Once the AI is connected, I can explain its electron configuration, reactivity, real-world uses, and more. For now this is a placeholder response.`
  }
  if (context.mode === 'reaction' && context.reaction) {
    return `I can see the reaction you're exploring. Once the AI is connected, I can walk you through the mechanism, energy changes, and real-world applications. For now this is a placeholder response.`
  }
  return `Thanks for your question! Once the AI backend is connected, I'll be able to help with any chemistry topic — reactions, elements, compounds, study questions, and more. For now this is a placeholder response.`
}
