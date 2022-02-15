import browser from 'webextension-polyfill'
import {Buffer} from 'buffer'
import {validateEvent, signEvent, getEventHash, getPublicKey} from 'nostr-tools'
import {encrypt, decrypt} from 'nostr-tools/nip04'

import {
  PERMISSIONS_REQUIRED,
  readPermissionLevel,
  updatePermission
} from './common'

const prompts = {}

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
        return Buffer.from(getPublicKey(sk)).toString('hex')
      }
      case 'getRelays': {
        let results = await browser.storage.local.get('relays')
        return results.relays || {}
      }
      case 'signEvent': {
        let {event} = params

        if (!event.pubkey)
          event.pubkey = Buffer.from(getPublicKey(sk)).toString('hex')
        if (!event.id) event.id = getEventHash(event)

        if (!validateEvent(event)) return {error: 'invalid event'}

        let signature = await signEvent(event, sk)
        return Buffer.from(signature).toString('hex')
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
      prompts[id]?.resolve?.()
      updatePermission(host, {
        level,
        condition
      })
      break
    case 'single':
      prompts[id]?.resolve?.()
      break
    case 'no':
      prompts[id]?.reject?.()
      break
  }

  delete prompts[id]
  browser.windows.remove(sender.tab.windowId)
}

function promptPermission(host, level, params) {
  let id = Math.random().toString().slice(4)
  let qs = new URLSearchParams({
    host,
    level,
    id,
    params: JSON.stringify(params)
  })

  return new Promise((resolve, reject) => {
    browser.windows.create({
      url: `${browser.runtime.getURL('prompt.html')}?${qs.toString()}`,
      type: 'popup',
      width: 340,
      height: 330
    })

    prompts[id] = {resolve, reject}
  })
}
