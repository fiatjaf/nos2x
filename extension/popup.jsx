import {render} from 'react-dom'
import {getPublicKey} from 'nostr-tools'
import {bech32} from 'bech32'
import React, {useState, useRef, useEffect} from 'react'

function Popup() {
  let [key, setKey] = useState('')
  let keys = useRef([])

  useEffect(() => {
    chrome.storage.local.get('private_key').then(results => {
      if (results.private_key) {
        let hexKey = getPublicKey(results.private_key)
        let npubKey = bech32.encode(
          'npub',
          bech32.toWords(Buffer.from(hexKey, 'hex'))
        )

        setKey(npubKey)

        keys.current.push(hexKey)
        keys.current.push(npubKey)
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
