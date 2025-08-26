import browser from 'webextension-polyfill'
import {createRoot} from 'react-dom/client'
import {getPublicKey} from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import React, {useState, useRef, useEffect} from 'react'
import QRCode from 'react-qr-code'
import { createBunkerSession, deleteBunkerConnection } from './bunker-provider'

function Popup() {
  let [pubKey, setPubKey] = useState('')
  let [hasBunkerConnection, setHasBunkerConnection] = useState(false)

  let keys = useRef([])

  useEffect(() => {
    browser.storage.local.get(['private_key', 'relays', 'local_privkey']).then(results => {
      // Check for bunker connection
      if (results.local_privkey) {
        setHasBunkerConnection(true)
      }
      if (results.private_key) {
        let hexKey = getPublicKey(results.private_key)
        let npubKey = nip19.npubEncode(hexKey)

        setPubKey(npubKey)

        keys.current.push(npubKey)
        keys.current.push(hexKey)

        if (results.relays) {
          let relaysList = []
          for (let url in results.relays) {
            if (results.relays[url].write) {
              relaysList.push(url)
              if (relaysList.length >= 3) break
            }
          }
          if (relaysList.length) {
            let nprofileKey = nip19.nprofileEncode({
              pubkey: hexKey,
              relays: relaysList
            })
            keys.current.push(nprofileKey)
          }
        }
      } else {
        setPubKey(null)
      }
    })
  }, [])

  return (
    <div style={{marginBottom: '5px'}}>
      <h2>nos2x</h2>
      {hasBunkerConnection ? (
        <div>
          <p>Bunker connected</p>
          <button onClick={disconnectBunker}>Disconnect bunker</button>
        </div>
      ) : (
        <div>
          <button onClick={connectBunker}>Connect bunker</button>
        </div>
      )}
    </div>
  )

  async function openOptionsButton() {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage()
    } else {
      window.open(browser.runtime.getURL('options.html'))
    }
  }

  function toggleKeyType(e) {
    e.preventDefault()
    let nextKeyType =
      keys.current[(keys.current.indexOf(pubKey) + 1) % keys.current.length]
    setPubKey(nextKeyType)
  }

  async function connectBunker() {
    const success = await createBunkerSession()
    if (success) {
      setHasBunkerConnection(true)
    }
  }

  async function disconnectBunker() {
    await deleteBunkerConnection()
    setHasBunkerConnection(false)
    // Clear global signer
    if (global.signer) {
      if (global.signer.close) {
        global.signer.close()
      }
      global.signer = null
    }
  }
}

createRoot(document.getElementById('main')).render(<Popup />)
