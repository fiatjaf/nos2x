import browser from 'webextension-polyfill'

// inject the script that will provide window.nostr
let script = document.createElement('script')
script.setAttribute('async', 'false')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', browser.runtime.getURL('nostr-provider.js'))
document.head.appendChild(script)

// listen for messages from that script
window.addEventListener('message', async ev => {
  if (ev.source !== window) return
  if (!ev.data || ev.data.ext !== 'nos2x') {
    // pass on to background
    var response
    try {
      response = browser.runtime.sendMessage({
        type: ev.data.type,
        params: ev.data.params,
        host: window.location.host
      })
    } catch (error) {
      response = {error}
    }

    // return response
    window.postMessage({id: ev.data.id, ext: 'nos2x', response})
  }
})
