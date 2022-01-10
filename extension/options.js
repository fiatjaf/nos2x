/* global document */

import browser from 'webextension-polyfill'

document
  .getElementById('privateKeyInput')
  .addEventListener('input', async ev => {
    try {
      await browser.storage.local.set({
        private_key: document.getElementById('privateKeyInput').value
      })
      showMessage('saved!')
    } catch (err) {
      showMessage(`error! ${err}`)
    }
  })

browser.storage.local.get('private_key').then(results => {
  document.getElementById('privateKeyInput').value = results.private_key
})

function showMessage(str) {
  document.getElementById('message').innerHTML = str
  setTimeout(() => {
    document.getElementById('message').innerHTML = ''
  }, 5000)
}
