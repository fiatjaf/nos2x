window.nostr = {
  _requests: {},
  _pubkey: null,
  _tweakedPubs: new Map(),

  _call(type, params) {
    return new Promise((resolve, reject) => {
      let id = Math.random().toString().slice(4)
      this._requests[id] = {resolve, reject}
      window.postMessage(
        {
          id,
          ext: 'nos2x',
          type,
          params
        },
        '*'
      )
    })
  },

  async getPublicKey(tweak) {
    if (typeof tweak === 'string') {
      const tweakedPubs = window.nostr._tweakedPubs
      if (!tweakedPubs.has(tweak)) {
        const pubkey = await window.nostr._call('getPublicKey', { tweak })
        tweakedPubs.set(tweak, pubkey)
      }
      return tweakedPubs.get(tweak)
    } else {
      if (this._pubkey) return this._pubkey
      this._pubkey = await window.nostr._call('getPublicKey', {})
      return this._pubkey
    }
  },

  async getHmacKey(key, format = 'SHA-256') {
    return window.nostr._call('getHmacKey', { key, format })
  },

  async signEvent(event, tweak) {
    return window.nostr._call('signEvent', { event, tweak })
  },

  async getRelays() {
    return this._call('getRelays', {})
  },

  nip04: {
    async encrypt(peer, plaintext) {
      return window.nostr._call('nip04.encrypt', {peer, plaintext})
    },

    async decrypt(peer, ciphertext) {
      return window.nostr._call('nip04.decrypt', {peer, ciphertext})
    }
  }
}

window.addEventListener('message', message => {
  if (
    !message.data ||
    message.data.response === null ||
    message.data.response === undefined ||
    message.data.ext !== 'nos2x' ||
    !window.nostr._requests[message.data.id]
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
  if (e.target.tagName !== 'A' || !e.target.href.startsWith('nostr:')) return
  if (replacing === false) return

  let response = await window.nostr._call('replaceURL', {url: e.target.href})
  if (response === false) {
    replacing = false
    return
  }

  e.target.href = response
}
