import browser from 'webextension-polyfill'
import {render} from 'react-dom'
import {generatePrivateKey, getPublicKey, nip19} from 'nostr-tools'
import React, {useState, useRef, useEffect} from 'react'
import QRCode from 'react-qr-code'

function Popup() {
  let [pubKey, setPubKey] = useState('')
  let [privKey, setPrivKey] = useState('')
  let [unsavedChanges, setUnsavedChanges] = useState([])

  let keys = useRef([])

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

  function handleKeyInput(e) {
    let key = e.target.value.toLowerCase().trim()
    console.log(key)
    setPrivKey(key)
    addUnsavedChanges('private_key')
  }

  async function saveKey() {
    if (!isKeyValid()) {
      console.log('PRIVATE KEY IS INVALID! did not save private key.')
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

    console.log('saved private key!')
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
  return (
    <>
      <h2>nos2x</h2>
      {pubKey === null ? (
        <div>
          <p style={{width: '150px'}}>
            {' '}
            set your private key here or generate a new one{' '}
          </p>
          <input
            type={'text'}
            // type={hidingPrivateKey ? 'password' : 'text'}
            style={{width: '300px'}}
            value={privKey}
            onChange={handleKeyInput}
          />
          <button
            disabled={!unsavedChanges.length}
            onClick={saveChanges}
            style={{padding: '5px 20px'}}
          >
            save
          </button>
          {privKey === '' && <button onClick={generate}>generate</button>}
          <p>
          <a target="_blank" href="/options.html">go to options page</a>
          </p>

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
              margin: '0 auto',
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
    </>
  )

  function toggleKeyType(e) {
    e.preventDefault()
    let nextKeyType =
      keys.current[(keys.current.indexOf(pubKey) + 1) % keys.current.length]
    setPubKey(nextKeyType)
  }
}

render(<Popup />, document.getElementById('main'))
