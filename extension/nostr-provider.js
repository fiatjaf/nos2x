window.nostr = {
  _requests: {},
  _pubkey: null,

  async getPublicKey() {
    if (this._pubkey) return this._pubkey
    this._pubkey = await this._call('getPublicKey', {})
    return this._pubkey
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
    let id = Math.random().toString().slice(-4)
    console.log(
      '%c[nos2x:%c' +
        id +
        '%c]%c calling %c' +
        type +
        '%c with %c' +
        JSON.stringify(params || {}),
      'background-color:#f1b912;font-weight:bold;color:white',
      'background-color:#f1b912;font-weight:bold;color:#a92727',
      'background-color:#f1b912;color:white;font-weight:bold',
      'color:auto',
      'font-weight:bold;color:#08589d;font-family:monospace',
      'color:auto',
      'font-weight:bold;color:#90b12d;font-family:monospace'
    )
    return new Promise((resolve, reject) => {
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

  console.log(
    '%c[nos2x:%c' +
      message.data.id +
      '%c]%c result: %c' +
      JSON.stringify(
        message?.data?.response || message?.data?.response?.error?.message || {}
      ),
    'background-color:#f1b912;font-weight:bold;color:white',
    'background-color:#f1b912;font-weight:bold;color:#a92727',
    'background-color:#f1b912;color:white;font-weight:bold',
    'color:auto',
    'font-weight:bold;color:#08589d'
  )

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
