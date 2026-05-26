const API_BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export async function parseTask(text) {
  try {
    return await request('/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  } catch {
    const { localParse } = await import('./localParser')
    return localParse(text)
  }
}

export async function getPulseSuggestions(tasks, userEnergy) {
  try {
    return await request('/pulse', {
      method: 'POST',
      body: JSON.stringify({ tasks, user_energy: userEnergy }),
    })
  } catch {
    const { localPulse } = await import('./localParser')
    return localPulse(tasks, userEnergy)
  }
}

export async function checkHealth() {
  return request('/health')
}
