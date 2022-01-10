// inject the script that will provide window.nostr
let script = document.createElement('script')
script.src = 'nostr-provider.js'
document.head.appendChild(script)

// listen for messages from that script
window.addEventListener('message', async ev => {
  if (ev.source !== window) return
  if (!ev.data || ev.data.ext !== 'nostr') {
    // pass on to background
    var reply
    try {
      reply = browser.runtime.sendMessage({
        ...ev.data,
        host: window.location.host
      })
    } catch (error) {
      reply = {error}
    }

    // return response
    window.postMessage({id: ev.data.id, reply})
  }
})
