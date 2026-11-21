import browser from 'webextension-polyfill'
import {validateEvent, finalizeEvent, getPublicKey} from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import * as nip04 from 'nostr-tools/nip04'
import * as nip44 from 'nostr-tools/nip44'
import {Mutex} from 'async-mutex'
import {LRUCache} from './utils'

import {
  NO_PERMISSIONS_REQUIRED,
  getPermissionStatus,
  updatePermission,
  showNotification,
  getPosition
} from './common'

let openPrompt = null
let promptMutex = new Mutex()
let releasePromptMutex = () => {}
let secretsCache = new LRUCache(100)
let previousSk = null

function getSharedSecret(sk, peer) {
  // Detect a key change and erase the cache if they changed their key
  if (previousSk !== sk) {
    secretsCache.clear()
    previousSk = sk
  }

  let key = secretsCache.get(peer)

  if (!key) {
    key = nip44.v2.utils.getConversationKey(sk, peer)
    secretsCache.set(peer, key)
  }

  return key
}

//set the width and height of the prompt window
const width = 440
const height = 420

function fromOwnPage(sender) {
  const base = browser.runtime.getURL('')
  return typeof sender?.url === 'string' && sender.url.startsWith(base)
}

function resolveSenderHost(sender, fallbackHost) {
  if (typeof sender?.url === 'string' && sender.url) {
    try {
      const parsed = new URL(sender.url)
      if (parsed.host) return parsed.host
    } catch (_) {
      // ignore invalid sender.url
    }
  }
  return fallbackHost
}

browser.runtime.onInstalled.addListener((_, __, reason) => {
  if (reason === 'install') browser.runtime.openOptionsPage()
})

browser.runtime.onMessage.addListener(async (message, sender) => {
  let {prompt} = message || {}
  if (prompt) {
    if (!fromOwnPage(sender)) {
      return {error: {message: 'unauthorized prompt sender'}}
    }
    return handlePromptMessage(message, sender)
  } else {
    const verifiedHost = resolveSenderHost(sender, message?.host)
    return handleContentScriptMessage({
      type: message?.type,
      params: message?.params,
      host: verifiedHost
    })
  }
})

browser.runtime.onMessageExternal.addListener(
  async ({type, params} = {}, sender) => {
    if (!sender?.url) {
      return {error: {message: 'unauthorized external sender'}}
    }
    let extensionId
    try {
      extensionId = new URL(sender.url).host
    } catch (_) {
      return {error: {message: 'invalid external sender URL'}}
    }
    if (!extensionId) {
      return {error: {message: 'missing external sender host'}}
    }
    return handleContentScriptMessage({type, params, host: extensionId})
  }
)

browser.windows.onRemoved.addListener(windowId => {
  if (openPrompt && openPrompt.windowId === windowId) {
    // Only reject if the closed window is the active prompt window itself
    handlePromptMessage({id: openPrompt.id, accept: false}, null)
  }
})

async function handleContentScriptMessage({type, params, host}) {
  if (NO_PERMISSIONS_REQUIRED[type]) {
    // authorized, and we won't do anything with private key here, so do a separate handler
    switch (type) {
      case 'peekPublicKey': {
        let allowed = await getPermissionStatus(host, 'getPublicKey')
        if (allowed === true) return performOperation('getPublicKey', params)
        return ''
      }
      case 'replaceURL': {
        let {protocol_handler: ph} = await browser.storage.local.get([
          'protocol_handler'
        ])
        if (!ph) return false

        let {url} = params || {}
        if (typeof url !== 'string' || !url.startsWith('nostr:')) return false
        let raw = url.split('nostr:')[1]
        if (!raw) return false

        let decoded
        try {
          decoded = nip19.decode(raw)
        } catch (_) {
          return false
        }
        let {type, data} = decoded
        let relays =
          (type === 'nprofile' || type === 'nevent') &&
          Array.isArray(data?.relays)
            ? data.relays
            : []
        let replacements = {
          raw,
          hrp: type,
          hex:
            type === 'npub' || type === 'note'
              ? data
              : type === 'nprofile'
              ? data.pubkey
              : type === 'nevent'
              ? data.id
              : null,
          p_or_e: {npub: 'p', note: 'e', nprofile: 'p', nevent: 'e'}[type],
          u_or_n: {npub: 'u', note: 'n', nprofile: 'u', nevent: 'n'}[type],
          relay0: relays[0] ?? null,
          relay1: relays[1] ?? null,
          relay2: relays[2] ?? null
        }
        let result = ph
        Object.entries(replacements).forEach(([pattern, value]) => {
          const safeVal =
            value === null || value === undefined
              ? ''
              : encodeURIComponent(String(value))
          result = result.replace(new RegExp(`{ *${pattern} *}`, 'g'), safeVal)
        })

        try {
          const parsed = new URL(result)
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return false
          }
          return parsed.toString()
        } catch (_) {
          return false
        }
      }
    }

    return
  } else {
    // acquire mutex here before reading policies
    releasePromptMutex = await promptMutex.acquire()

    let allowed = await getPermissionStatus(
      host,
      type,
      type === 'signEvent' ? params?.event : undefined
    )

    if (allowed === true) {
      // authorized, proceed
      releasePromptMutex()
      showNotification(host, allowed, type, params)
    } else if (allowed === false) {
      // denied, just refuse immediately without touching private key
      releasePromptMutex()
      showNotification(host, allowed, type, params)
      return {
        error: {message: 'denied'}
      }
    } else {
      // ask for authorization BEFORE performing any cryptographic operation
      // and never pass decrypted plaintext or pre-signed events in prompt URL query parameters
      try {
        let id = crypto.randomUUID()
        let qs = new URLSearchParams({
          host,
          id,
          params: JSON.stringify(params),
          type
        })
        // center prompt
        const {top, left} = await getPosition(width, height)
        // prompt will be resolved with true or false
        let accept = await new Promise((resolve, reject) => {
          openPrompt = {id, host, type, resolve, reject}

          browser.windows
            .create({
              url: `${browser.runtime.getURL('prompt.html')}?${qs.toString()}`,
              type: 'popup',
              width: width,
              height: height,
              top: top,
              left: left
            })
            .then(win => {
              if (openPrompt && openPrompt.id === id) {
                openPrompt.windowId = win.id
              }
            })
            .catch(reject)
        })

        // denied, stop here without touching private key
        if (!accept) return {error: {message: 'denied'}}
      } catch (err) {
        // errored, stop here
        openPrompt = null
        releasePromptMutex()
        return {
          error: {message: err.message, stack: err.stack}
        }
      }
    }

    // Perform the cryptographic operation only after explicit authorization
    return await performOperation(type, params)
  }
}

async function performOperation(type, params) {
  let results = await browser.storage.local.get('private_key')
  if (!results || !results.private_key) {
    return {error: {message: 'no private key found'}}
  }

  let sk = results.private_key
  try {
    switch (type) {
      case 'getPublicKey': {
        return getPublicKey(sk)
      }
      case 'signEvent': {
        if (!params?.event || typeof params.event !== 'object') {
          return {error: {message: 'invalid event'}}
        }
        const eventClone = {...params.event}
        const event = finalizeEvent(eventClone, sk)
        return validateEvent(event)
          ? event
          : {error: {message: 'invalid event'}}
      }
      case 'nip04.encrypt': {
        let {peer, plaintext} = params
        return nip04.encrypt(sk, peer, plaintext)
      }
      case 'nip04.decrypt': {
        let {peer, ciphertext} = params
        return nip04.decrypt(sk, peer, ciphertext)
      }
      case 'nip44.encrypt': {
        const {peer, plaintext} = params
        const key = getSharedSecret(sk, peer)

        return nip44.v2.encrypt(plaintext, key)
      }
      case 'nip44.decrypt': {
        const {peer, ciphertext} = params
        const key = getSharedSecret(sk, peer)

        return nip44.v2.decrypt(ciphertext, key)
      }
      default: {
        return {error: {message: `unknown operation type "${type}"`}}
      }
    }
  } catch (error) {
    return {error: {message: error.message, stack: error.stack}}
  }
}

async function handlePromptMessage({id, accept, conditions}, sender) {
  if (!openPrompt) {
    return
  }

  if (id !== openPrompt.id) {
    return
  }

  if (sender) {
    if (!fromOwnPage(sender)) {
      return
    }
    if (
      openPrompt.windowId !== undefined &&
      sender.tab?.windowId !== undefined &&
      sender.tab.windowId !== openPrompt.windowId
    ) {
      return
    }
  }

  const currentPrompt = openPrompt
  openPrompt = null

  // update policies using authoritative host & type recorded when prompt opened
  if (conditions && currentPrompt.host && currentPrompt.type) {
    await updatePermission(
      currentPrompt.host,
      currentPrompt.type,
      accept,
      conditions
    )
  }

  // return response after updating policies
  currentPrompt.resolve?.(accept)

  // release mutex here after updating policies
  releasePromptMutex()

  // close prompt
  if (sender?.tab?.windowId !== undefined) {
    browser.windows.remove(sender.tab.windowId)
  }
}
