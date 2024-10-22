import browser from 'webextension-polyfill'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import {validateEvent, finalizeEvent, getPublicKey} from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import * as nip04 from 'nostr-tools/nip04'
import * as nip44 from 'nostr-tools/nip44'
import * as nip46 from 'nostr-tools/nip46'
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
let cachedBunkerSigner = {
  privateKeyHex: '',
  bunkerUrl: '',
  signerPromise: null,
}

async function createBunkerSigner(privateKey, bunkerUrl) {
  console.info('creating bunker signer')
  const pointer = await nip46.parseBunkerInput(bunkerUrl)
  console.info('bunker signer', privateKey, pointer)
  const signer = new nip46.BunkerSigner(privateKey, pointer, {
    onauth: async (authUrl) => {
      console.log("onauth", authUrl)
      const {top, left} = await getPosition(authWidth, authHeight)
      browser.windows.create({
        url: authUrl,
        type: 'popup',
        width: authWidth,
        height: authHeight,
        top: top,
        left: left
      })
    }
  })
  await signer.connect()
  return signer
}

function getBunkerSigner(privateKeyStringOrUint8Array, bunkerUrl) {
  const privateKey = privateKeyStringOrUint8Array instanceof Uint8Array ? privateKeyStringOrUint8Array : hexToBytes(privateKeyStringOrUint8Array)
  const privateKeyHex = bytesToHex(privateKey)
  if (cachedBunkerSigner.privateKeyHex !== privateKeyHex || cachedBunkerSigner.bunkerUrl !== bunkerUrl || !cachedBunkerSigner.signerPromise) {
    if (cachedBunkerSigner.signerPromise) {
      cachedBunkerSigner.signerPromise.then((oldBunkerSigner) => {
        if (oldBunkerSigner) {
          return oldBunkerSigner.close()
        }
      })
    }
    const newCachedBunkerSigner = {
      privateKeyHex,
      bunkerUrl,
      signerPromise: createBunkerSigner(privateKey, bunkerUrl).catch((err) => {
        // will retry parsing on next call
        newCachedBunkerSigner.signerPromise = null
        throw err
      })
    }
    cachedBunkerSigner = newCachedBunkerSigner
  }
  return cachedBunkerSigner.signerPromise
}

function getSharedSecret(sk, peer) {
  // Detect a key change and erase the cache if they changed their key
  if (previousSk !== sk) {
    secretsCache.clear()
  }

  let key = secretsCache.get(peer)

  if (!key) {
    key = nip44.v2.utils.getConversationKey(sk, peer)
    secretsCache.set(peer, key)
  }

  return key
}

//set the width and height of the prompt window
const width = 340
const height = 360

const authWidth = 800
const authHeight = 800

browser.runtime.onInstalled.addListener((_, __, reason) => {
  if (reason === 'install') browser.runtime.openOptionsPage()
})

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.openSignUp) {
    openSignUpWindow()
    browser.windows.remove(sender.tab.windowId)
  } else {
    let {prompt} = message
    if (prompt) {
      handlePromptMessage(message, sender)
    } else {
      return handleContentScriptMessage(message)
    }
  }
})

browser.runtime.onMessageExternal.addListener(
  async ({type, params}, sender) => {
    let extensionId = new URL(sender.url).host
    return handleContentScriptMessage({type, params, host: extensionId})
  }
)

browser.windows.onRemoved.addListener(_ => {
  if (openPrompt) {
    // calling this with a simple "no" response will not store anything, so it's fine
    // it will just return a failure
    handlePromptMessage({accept: false}, null)
  }
})

async function handleContentScriptMessage({type, params, host}) {
  if (NO_PERMISSIONS_REQUIRED[type]) {
    // authorized, and we won't do anything with private key here, so do a separate handler
    switch (type) {
      case 'replaceURL': {
        let {protocol_handler: ph} = await browser.storage.local.get([
          'protocol_handler'
        ])
        if (!ph) return false

        let {url} = params
        let raw = url.split('nostr:')[1]
        let {type, data} = nip19.decode(raw)
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
          relay0: type === 'nprofile' ? data.relays[0] : null,
          relay1: type === 'nprofile' ? data.relays[1] : null,
          relay2: type === 'nprofile' ? data.relays[2] : null
        }
        let result = ph
        Object.entries(replacements).forEach(([pattern, value]) => {
          result = result.replace(new RegExp(`{ *${pattern} *}`, 'g'), value)
        })

        return result
      }
    }

    return
  } else {
    // acquire mutex here before reading policies
    releasePromptMutex = await promptMutex.acquire()

    let allowed = await getPermissionStatus(
      host,
      type,
      type === 'signEvent' ? params.event : undefined
    )

    if (allowed === true) {
      // authorized, proceed
      releasePromptMutex()
      showNotification(host, allowed, type, params)
    } else if (allowed === false) {
      // denied, just refuse immediately
      releasePromptMutex()
      showNotification(host, allowed, type, params)
      return {
        error: {message: 'denied'}
      }
    } else {
      // ask for authorization
      try {
        let id = Math.random().toString().slice(4)
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
          openPrompt = {resolve, reject}

          browser.windows.create({
            url: `${browser.runtime.getURL('prompt.html')}?${qs.toString()}`,
            type: 'popup',
            width: width,
            height: height,
            top: top,
            left: left
          })
        })

        // denied, stop here
        if (!accept) return {error: {message: 'denied'}}
      } catch (err) {
        // errored, stop here
        releasePromptMutex()
        return {
          error: {message: error.message, stack: error.stack}
        }
      }
    }
  }

  // if we're here this means it was accepted
  let results = await browser.storage.local.get(['private_key', 'bunker_url'])
  if (!results || !results.private_key) {
    return {error: {message: 'no private key found'} }
  }

  let bunkerSigner = null
  if (results.bunker_url) {
    try {
      bunkerSigner = await getBunkerSigner(results.private_key, results.bunker_url)
    } catch (err) {
      return {error: {message: 'failed to connect to bunker url'}}
    }
  }

  let sk = results.private_key

  try {
    switch (type) {
      case 'getPublicKey': {
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.getPublicKey()
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to get public key from bunker'}}
          }
        }
        return getPublicKey(sk)
      }
      case 'getRelays': {
        let results = await browser.storage.local.get('relays')
        return results.relays || {}
      }
      case 'signEvent': {
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.signEvent(params.event)
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to sign event using bunker'}}
          }
        }
        const event = finalizeEvent(params.event, sk)

        return validateEvent(event)
          ? event
          : {error: {message: 'invalid event'}}
      }
      case 'nip04.encrypt': {
        let {peer, plaintext} = params
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.nip04Encrypt(peer, plaintext)
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to encrypt event using bunker'}}
          }
        }
        return nip04.encrypt(sk, peer, plaintext)
      }
      case 'nip04.decrypt': {
        let {peer, ciphertext} = params
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.nip04Decrypt(peer, ciphertext)
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to encrypt event using bunker'}}
          }
        }
        return nip04.decrypt(sk, peer, ciphertext)
      }
      case 'nip44.encrypt': {
        const {peer, plaintext} = params
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.nip44Encrypt(peer, plaintext)
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to encrypt event using bunker'}}
          }
        }
        const key = getSharedSecret(sk, peer)

        return nip44.v2.encrypt(plaintext, key)
      }
      case 'nip44.decrypt': {
        const {peer, ciphertext} = params
        if (bunkerSigner) {
          try {
            const bunkerResult = await bunkerSigner.nip44Decrypt(peer, ciphertext)
            return bunkerResult
          } catch (err) {
            return {error: {message: 'failed to encrypt event using bunker'}}
          }
        }
        const key = getSharedSecret(sk, peer)

        return nip44.v2.decrypt(ciphertext, key)
      }
    }
  } catch (error) {
    return {error: {message: error.message, stack: error.stack}}
  }
}

async function handlePromptMessage({host, type, accept, conditions}, sender) {
  // return response
  openPrompt?.resolve?.(accept)

  // update policies
  if (conditions) {
    await updatePermission(host, type, accept, conditions)
  }

  // cleanup this
  openPrompt = null

  // release mutex here after updating policies
  releasePromptMutex()

  // close prompt
  if (sender) {
    browser.windows.remove(sender.tab.windowId)
  }
}

async function openSignUpWindow() {
  const {top, left} = await getPosition(width, height)

  browser.windows.create({
    url: `${browser.runtime.getURL('signup.html')}`,
    type: 'popup',
    width: width,
    height: height,
    top: top,
    left: left
  })
}
