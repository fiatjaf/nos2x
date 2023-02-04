const crypto = globalThis.crypto

const ec = new TextEncoder()

export async function hmac (key, data, format = 'SHA-256') {
  if (typeof key !== 'string')  throw TypeError('key must be a string!')
  if (typeof data !== 'string') throw TypeError('key must be a string!')

  key  = ec.encode(key)
  data = ec.encode(data)

  const cryptoKey = await importKey(key, format)
  return crypto.subtle
    .sign('HMAC', cryptoKey, data)
    .then((buffer) => new Uint8Array(buffer))
    .then((raw) => bytesToHex(raw))
}

async function importKey (key, fmt) {
  const config = { name: 'HMAC', hash: fmt }
  return crypto.subtle.importKey(
    'raw', key, config, false, ['sign', 'verify']
  )
}

function bytesToHex (bytes) {
  const arr = []
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i]
      .toString(16)
      .padStart(2, '0')
    arr.push(hex)
  }
  return arr.join('')
}
