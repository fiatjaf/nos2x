import browser from 'webextension-polyfill'
import {Buffer} from 'buffer'
import {validateEvent, signEvent, getEventHash, getPublicKey} from 'nostr-tools'

browser.runtime.onMessage.addListener(async (req, sender) => {
  let {type, params, host} = req

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
})
