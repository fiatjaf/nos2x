import browser from 'webextension-polyfill'
import {validateEvent, signEvent, getPublicKey} from 'nostr-tools'

browser.runtime.onMessage.addListener(async (req, sender, reply) => {
  let {type, params, host} = req

  try {
    switch (type) {
      case 'getPublicKey': {
        let results = browser.storage.local.get('private_key')
        if (results && results.private_key) {
          reply(getPublicKey(results.private_key))
        } else {
          reply({error: 'no private key found'})
        }
        break
      }
      case 'signEvent': {
        let {event} = params
        if (!validateEvent(event)) return reply({error: 'invalid event'})

        let results = browser.storage.local.get('private_key')
        if (results && results.private_key) {
          reply(signEvent(event, results.private_key))
        } else {
          reply({error: 'no private key found'})
        }
        break
      }
    }
  } catch (error) {
    reply({error})
  }
})
