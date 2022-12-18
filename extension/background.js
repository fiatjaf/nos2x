import browser from 'webextension-polyfill'
import {validateEvent, signEvent, getEventHash, getPublicKey} from 'nostr-tools'
import {encrypt, decrypt} from 'nostr-tools/nip04'
import {Mutex} from 'async-mutex'

import {
  PERMISSIONS_REQUIRED,
  readPermissionLevel,
  updatePermission
} from './common'

let openPrompt = null
let promptMutex = new Mutex()
let releasePromptMutex = () => {}

browser.runtime.onInstalled.addListener((_, __, reason) => {
  if (reason === 'install') browser.runtime.openOptionsPage()
})

browser.runtime.onMessage.addListener(async (req, sender) => {
  let {prompt} = req

  if (prompt) {
    return handlePromptMessage(req, sender)
  } else {
    return handleContentScriptMessage(req)
  }
})

browser.runtime.onMessageExternal.addListener(
  async ({type, params}, sender) => {
    let extensionId = new URL(sender.url).host
    return handleContentScriptMessage({type, params, host: extensionId})
  }
)

browser.windows.onRemoved.addListener(windowId => {
  if (openPrompt) {
    handlePromptMessage({condition: 'no'}, null)
  }
})

async function handleContentScriptMessage({type, params, host}) {
  let level = await readPermissionLevel(host)

  if (level >= PERMISSIONS_REQUIRED[type]) {
    // authorized, proceed
  } else {
    // ask for authorization
    try {
      await promptPermission(host, PERMISSIONS_REQUIRED[type], params)
      // authorized, proceed
    } catch (_) {
      // not authorized, stop here
      return {
        error: `insufficient permissions, required ${PERMISSIONS_REQUIRED[type]}`
      }
    }
  }

  let results = await browser.storage.local.get('private_key')
  if (!results || !results.private_key) {
    return {error: 'no private key found'}
  }

  let sk = results.private_key

  try {
    switch (type) {
      case 'getPublicKey': {
        return getPublicKey(sk)
      }
      case 'getRelays': {
        let results = await browser.storage.local.get('relays')
        return results.relays || {}
      }
      case 'signEvent': {
        let {event} = params

        if (!event.pubkey) event.pubkey = getPublicKey(sk)
        if (!event.id) event.id = getEventHash(event)
        if (!validateEvent(event)) return {error: 'invalid event'}

        event.sig = await signEvent(event, sk)
        return event
      }
      case 'nip04.encrypt': {
        let {peer, plaintext} = params
        return encrypt(sk, peer, plaintext)
      }
      case 'nip04.decrypt': {
        let {peer, ciphertext} = params
        return decrypt(sk, peer, ciphertext)
      }
    }
  } catch (error) {
    return {error: {message: error.message, stack: error.stack}}
  }
}

function handlePromptMessage({id, condition, host, level}, sender) {
  switch (condition) {
    case 'forever':
    case 'expirable':
      openPrompt?.resolve?.()
      updatePermission(host, {
        level,
        condition
      })
      break
    case 'single':
      openPrompt?.resolve?.()
      break
    case 'no':
      openPrompt?.reject?.()
      break
  }

  openPrompt = null
  releasePromptMutex()

  if (sender) {
    browser.windows.remove(sender.tab.windowId)
  }
}

async function promptPermission(host, level, params) {
  releasePromptMutex = await promptMutex.acquire()

  let id = Math.random().toString().slice(4)
  let qs = new URLSearchParams({
    host,
    level,
    id,
    params: JSON.stringify(params)
  })

  return new Promise((resolve, reject) => {
    openPrompt = {resolve, reject}

    browser.windows.create({
      url: `${browser.runtime.getURL('prompt.html')}?${qs.toString()}`,
      type: 'popup',
      width: 340,
      height: 330
    })
  })
}
