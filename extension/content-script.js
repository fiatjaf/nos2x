import browser from 'webextension-polyfill'
import {PAGE_CALLABLE_METHODS} from './common'

// inject the script that will provide window.nostr
let script = document.createElement('script')
script.setAttribute('async', 'false')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', browser.runtime.getURL('nostr-provider.js'))
document.head.appendChild(script)

// listen for messages from that script
window.addEventListener('message', async message => {
  if (message.source !== window) return
  if (!message.data) return
  if (!message.data.params) return
  if (message.data.ext !== 'nos2x') return

  if (!PAGE_CALLABLE_METHODS.has(message.data.type)) {
    window.postMessage(
      {
        id: message.data.id,
        ext: 'nos2x',
        response: {
          error: {message: `${message.data.type} is not callable from a page`}
        }
      },
      message.origin
    )
    return
  }

  // pass on to background
  var response
  try {
    response = await browser.runtime.sendMessage({
      type: message.data.type,
      params: message.data.params,
      host: location.host
    })
  } catch (error) {
    response = {error}
  }

  // return response
  window.postMessage(
    {id: message.data.id, ext: 'nos2x', response},
    message.origin
  )
})
