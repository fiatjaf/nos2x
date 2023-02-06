import { utils } from '@noble/secp256k1'

const crypto = window.crypto

const ec = new TextEncoder()

export async function hmac (key, data, format = 'SHA-256') {
  try {
    if (typeof key === 'string') {
      // Ensure key is in byte format.
      key = ec.encode(key)
    }

    if (typeof data === 'string') {
      // Ensure data is in byte format.
      data = utils.hexToBytes(data)
    }

    const cryptoKey = await importKey(key, format)

    return crypto.subtle
      .sign('HMAC', cryptoKey, data)
      .then((buffer) => new Uint8Array(buffer))
  } catch (err) {
    throw new Error('hmac operation failed for key:' + String(key))
  }
}

async function importKey (key, fmt) {
  const config = { name: 'HMAC', hash: fmt }
  return crypto.subtle.importKey(
    'raw', key, config, false, ['sign', 'verify']
  )
}
