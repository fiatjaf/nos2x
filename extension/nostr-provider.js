window.nostr = {
  _requests: {},
  _pubkey: null,

  async getPublicKey() {
    if (this._pubkey) return this._pubkey
    this._pubkey = await this._call('getPublicKey', {})
    return this._pubkey
  },

  async peekPublicKey() {
    return this._call('peekPublicKey', {})
  },

  async signEvent(event) {
    return this._call('signEvent', {event})
  },

  async getRelays() {
    return {}
  },

  nip04: {
    async encrypt(peer, plaintext) {
      return window.nostr._call('nip04.encrypt', {peer, plaintext})
    },

    async decrypt(peer, ciphertext) {
      return window.nostr._call('nip04.decrypt', {peer, ciphertext})
    }
  },

  nip44: {
    async encrypt(peer, plaintext) {
      return window.nostr._call('nip44.encrypt', {peer, plaintext})
    },

    async decrypt(peer, ciphertext) {
      return window.nostr._call('nip44.decrypt', {peer, ciphertext})
    }
  },

  _call(type, params) {
    let id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Array.from(crypto.getRandomValues(new Uint8Array(16)), b =>
            b.toString(16).padStart(2, '0')
          ).join('')
    let targetOrigin =
      typeof window.location?.origin === 'string' &&
      window.location.origin !== 'null'
        ? window.location.origin
        : '*'
    return new Promise((resolve, reject) => {
      this._requests[id] = {resolve, reject}
      window.postMessage(
        {
          id,
          ext: 'nos2x',
          type,
          params
        },
        targetOrigin
      )
    })
  }
}

window.addEventListener('message', message => {
  if (
    message.source !== window ||
    !message.data ||
    message.data.response === null ||
    message.data.response === undefined ||
    message.data.ext !== 'nos2x' ||
    !Object.prototype.hasOwnProperty.call(
      window.nostr._requests,
      message.data.id
    )
  )
    return

  if (message.data.response.error) {
    let error = new Error('nos2x: ' + message.data.response.error.message)
    error.stack = message.data.response.error.stack
    window.nostr._requests[message.data.id].reject(error)
  } else {
    window.nostr._requests[message.data.id].resolve(message.data.response)
  }

  delete window.nostr._requests[message.data.id]
})

// hack to replace nostr:nprofile.../etc links with something else
let replacing = null
document.addEventListener('mousedown', replaceNostrSchemeLink)
async function replaceNostrSchemeLink(e) {
  const anchor = e.target?.closest ? e.target.closest('a') : e.target
  if (!anchor || anchor.tagName !== 'A' || !anchor.href?.startsWith('nostr:'))
    return
  if (replacing === false) return

  let response = await window.nostr._call('replaceURL', {url: anchor.href})
  if (response === false) {
    replacing = false
    return
  }

  if (
    typeof response === 'string' &&
    (response.startsWith('https://') || response.startsWith('http://'))
  ) {
    anchor.href = response
  }
}
