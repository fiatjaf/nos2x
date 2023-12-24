import browser from 'webextension-polyfill'
import {render} from 'react-dom'
import {generatePrivateKey, getPublicKey, nip19} from 'nostr-tools'
import React, {useState, useRef, useEffect, useCallback} from 'react'
import QRCode from 'react-qr-code'

function Popup() {
  let [pubKey, setPubKey] = useState('')
  let [privKey, setPrivKey] = useState('')
  let [unsavedChanges, setUnsavedChanges] = useState([])
  let [messages, setMessages] = useState([])

  let keys = useRef([])

  const showMessage = useCallback(msg => {
    messages.push(msg)
    setMessages(messages)
    setTimeout(() => setMessages([]), 3000)
  })

  useEffect(() => {
    browser.storage.local.get(['private_key', 'relays']).then(results => {
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
  //window opening function
  // function openSignUpWindow() {
  //   browser.runtime.sendMessage({openSignUp: true})
  //   setTimeout(() => window.close(), 100)
  // }

  function handleNewKey() {
    generate()
  }

  return (
    <div>
      <h2>nos2x</h2>
      {pubKey === null ? (
        <div>
          <p>Set nostr private key</p>
          <div style={{fontSize: '120%', marginBottom: '5px'}}>
            {messages.map((message, i) => (
              <div key={i}>{message}</div>
            ))}
          </div>
          <div className="input-button-container">
            <input
              type="password"
              placeholder="nsec1s62xy..."
              style={{
                width: '300px',
                outline: 'none',
                border: '0.5px solid #ccc'
              }}
              value={privKey}
              onChange={handleKeyInput}
            />
            <button
              disabled={!unsavedChanges.length}
              onClick={saveChanges}
            >
              Save
            </button>
          </div>
          <div className="input-button-container">
            <button onClick={handleNewKey}>
              Create a new profile{' '}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p>
            <a onClick={toggleKeyType}>↩️</a> your public key:
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              width: '200px'
            }}
          >
            <code>{pubKey}</code>
          </pre>

          <div
            style={{
              height: 'auto',
              // margin: '0 auto',
              maxWidth: 256,
              width: '100%'
            }}
          >
            <QRCode
              size={256}
              style={{height: 'auto', maxWidth: '100%', width: '100%'}}
              value={pubKey.startsWith('n') ? pubKey.toUpperCase() : pubKey}
              viewBox={`0 0 256 256`}
            />
          </div>
        </>
      )}
    </div>
  )

  function toggleKeyType(e) {
    e.preventDefault()
    let nextKeyType =
      keys.current[(keys.current.indexOf(pubKey) + 1) % keys.current.length]
    setPubKey(nextKeyType)
  }
  function handleKeyInput(e) {
    let key = e.target.value.toLowerCase().trim()
    setPrivKey(key)
    addUnsavedChanges('private_key')
  }

  async function saveKey() {
    if (!isKeyValid()) {
      showMessage('PRIVATE KEY IS INVALID! did not save private key.')
      return
    }

    let hexOrEmptyKey = privKey

    try {
      let {type, data} = nip19.decode(privKey)
      if (type === 'nsec') hexOrEmptyKey = data
    } catch (_) {}

    await browser.storage.local.set({
      private_key: hexOrEmptyKey
    })

    if (hexOrEmptyKey !== '') {
      setPrivKey(nip19.nsecEncode(hexOrEmptyKey))
    }
    showMessage('Key saved! You are ready to go!')
    setTimeout(() => window.close(), 3000)
  }

  function isKeyValid() {
    if (privKey === '') return true
    if (privKey.match(/^[a-f0-9]{64}$/)) return true
    try {
      if (nip19.decode(privKey).type === 'nsec') return true
    } catch (_) {}
    return false
  }

  function addUnsavedChanges(section) {
    if (!unsavedChanges.find(s => s === section)) {
      unsavedChanges.push(section)
      setUnsavedChanges(unsavedChanges)
    }
  }

  async function saveChanges() {
    for (let section of unsavedChanges) {
      switch (section) {
        case 'private_key':
          await saveKey()
          break
      }
    }
    setUnsavedChanges([])
  }

  async function generate() {
    setPrivKey(nip19.nsecEncode(generatePrivateKey()))
    addUnsavedChanges('private_key')
  }
}

render(<Popup />, document.getElementById('main'))
