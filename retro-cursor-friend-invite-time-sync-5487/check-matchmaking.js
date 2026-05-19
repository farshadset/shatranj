#!/usr/bin/env node

const baseUrl = 'http://127.0.0.1:3001'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const payload = await response.text()
  let json
  try {
    json = payload ? JSON.parse(payload) : null
  } catch (err) {
    throw new Error(`Failed to parse JSON from ${path}: ${err.message}\n${payload}`)
  }
  if (!response.ok) {
    const message = json?.error?.message || `HTTP ${response.status}`
    throw new Error(`Request failed ${path}: ${message}`)
  }
  return json
}

function makeClientId(role) {
  return `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function quickMatch(name, clientId) {
  return fetchJson('/api/chess/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      timeControlMinutes: 10,
      incrementSeconds: 2,
      quickMatch: true,
      clientId,
    }),
  })
}

async function getRoom(roomId) {
  return fetchJson(`/api/chess/rooms/${roomId}`)
}

async function main() {
  console.log('Checking backend health...')
  const health = await fetchJson('/api/health')
  console.log('Health OK:', health.ok)
  console.log('Runtime store mode:', health.runtime?.storeMode || 'unknown')
  console.log('Single instance only:', health.runtime?.singleInstanceOnly)

  const firstName = `match-a-${Date.now()}`
  const secondName = `match-b-${Date.now()}`
  const firstClientId = makeClientId('a')
  const secondClientId = makeClientId('b')

  console.log('\nCreating first quick-match request...')
  const firstResponse = await quickMatch(firstName, firstClientId)
  console.log('First room:', firstResponse.snapshot.roomId, 'status:', firstResponse.snapshot.status)

  console.log('Creating second quick-match request...')
  const secondResponse = await quickMatch(secondName, secondClientId)
  console.log('Second room:', secondResponse.snapshot.roomId, 'status:', secondResponse.snapshot.status)

  if (firstResponse.snapshot.roomId !== secondResponse.snapshot.roomId) {
    throw new Error('Quick-match did not return the same room for both players.')
  }

  const roomId = firstResponse.snapshot.roomId
  if (secondResponse.snapshot.status !== 'active') {
    console.log('Second player did not activate room immediately, retrying room state retrieval...')
    await sleep(1000)
  }

  const roomSnapshot = await getRoom(roomId)
  console.log('Final room state:', roomSnapshot.snapshot.status)
  console.log('Players:', JSON.stringify(roomSnapshot.snapshot.players, null, 2))
  console.log('Session colors:')
  console.log('  first:', firstResponse.session.color)
  console.log('  second:', secondResponse.session.color)

  if (roomSnapshot.snapshot.status !== 'active') {
    throw new Error('Room is not active after quick match.')
  }

  if (!firstResponse.session.color || !secondResponse.session.color) {
    throw new Error('One or both players did not receive a color assignment.')
  }

  if (firstResponse.session.color === secondResponse.session.color) {
    throw new Error('Both players were assigned the same color.')
  }

  console.log('\n✅ Quick-match opponent search works. Room is active and both players are assigned opposite colors.')
}

main().catch((err) => {
  console.error('\n❌ Matchmaking verification failed:')
  console.error(err.message)
  process.exit(1)
})
