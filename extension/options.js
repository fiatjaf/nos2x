/* global document */

import browser from 'webextension-polyfill'

document.getElementById('privateKeyInput').addEventListener('input', ev => {
  browser.storage.local
    .set({private_key: document.getElementById('privateKeyInput').value})
    .then(() => {
      console.log('success')
    })
})

browser.storage.local.get('private_key').then(results => {
  document.getElementById('privateKeyInput').value = results.private_key
})
