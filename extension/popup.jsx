import browser from 'webextension-polyfill'
import {render} from 'react-dom'
import {getPublicKey, nip19} from 'nostr-tools'
import React, {useState, useRef, useEffect} from 'react'

function Popup() {
  let [key, setKey] = useState('')
  let keys = useRef([])

  useEffect(() => {
    browser.storage.local.get(['private_key', 'relays']).then(results => {
      if (results.private_key) {
        let hexKey = getPublicKey(results.private_key)
        let npubKey = nip19.npubEncode(hexKey)

        setKey(npubKey)

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
        setKey(null)
      }
    })
  }, [])

  return (
    <>
      <h2>nos2x</h2>
      {key === null ? (
        <p style={{width: '150px'}}>
          you don't have a private key set. use the options page to set one.
        </p>
      ) : (
        <>
          <p>
            <a onClick={toggleKeyType}>↩️</a> your public key:
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              width: '100px'
            }}
          >
            <code>{key}</code>
          </pre>
        </>
      )}
    </>
  )

  function toggleKeyType(e) {
    e.preventDefault()
    let nextKeyType =
      keys.current[(keys.current.indexOf(key) + 1) % keys.current.length]
    setKey(nextKeyType)
  }
}

render(<Popup />, document.getElementById('main'))
