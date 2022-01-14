import browser from 'webextension-polyfill'
import {Buffer} from 'buffer'
import {validateEvent, signEvent, getEventHash, getPublicKey} from 'nostr-tools'

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

async function handleContentScriptMessage({type, params, host}) {
  let level = await readPermissionLevel(host)

  if (level >= PERMISSIONS_REQUIRED[type]) {
    // authorized, proceed
  } else {
    // ask for authorization
    try {
      await promptPermission(host, PERMISSIONS_REQUIRED[type])
      // authorized, proceed
    } catch (_) {
      // not authorized, stop here
      return {
        error: `insufficient permissions, required ${PERMISSIONS_REQUIRED[type]}`
      }
    }
  }

  try {
    switch (type) {
      case 'getPublicKey': {
        let results = await browser.storage.local.get('private_key')
        if (results && results.private_key) {
          return Buffer.from(getPublicKey(results.private_key)).toString('hex')
        } else {
          return {error: 'no private key found'}
        }
      }
      case 'signEvent': {
        let {event} = params

        let results = await browser.storage.local.get('private_key')
        if (results && results.private_key) {
          if (!event.pubkey)
            event.pubkey = Buffer.from(
              getPublicKey(results.private_key)
            ).toString('hex')
          if (!event.id) event.id = getEventHash(event)

          if (!validateEvent(event)) return {error: 'invalid event'}

          let signature = await signEvent(event, results.private_key)
          return Buffer.from(signature).toString('hex')
        } else {
          return {error: 'no private key found'}
        }
      }
    }
  } catch (error) {
    return {error}
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

function promptPermission(host, level) {
  let id = Math.random().toString().slice(4)
  let qs = new URLSearchParams({host, level, id})

  return new Promise((resolve, reject) => {
    browser.windows.create({
      url: `${browser.runtime.getURL('prompt.html')}?${qs.toString()}`,
      type: 'popup',
      width: 340,
      height: 230
    })

    prompts[id] = {resolve, reject}
  })
}
