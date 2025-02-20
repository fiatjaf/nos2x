import {bytesToHex, hexToBytes} from '@noble/hashes/utils'
import {getPublicKey} from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import {decrypt, encrypt} from 'nostr-tools/nip49'
import {generateSecretKey} from 'nostr-tools/pure'
import React, {useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import QRCode from 'react-qr-code'
import browser from 'webextension-polyfill'
import {removePermissions} from './common'

function Options() {
  let [unsavedChanges, setUnsavedChanges] = useState([])
  let [privKey, setPrivKey] = useState(null)
  let [privKeyInput, setPrivKeyInput] = useState('')
  let [askPassword, setAskPassword] = useState(null)
  let [password, setPassword] = useState('')
  let [policies, setPermissions] = useState([])
  let [protocolHandler, setProtocolHandler] = useState('https://njump.me/{raw}')
  let [hidingPrivateKey, hidePrivateKey] = useState(true)
  let [showNotifications, setNotifications] = useState(false)
  let [messages, setMessages] = useState([])
  let [handleNostrLinks, setHandleNostrLinks] = useState(false)
  let [showProtocolHandlerHelp, setShowProtocolHandlerHelp] = useState(false)
  let [selectedItems, setSelectedItems] = useState([])

  const showMessage = msg => {
    setMessages(oldMessages => [...oldMessages, msg])
  }

  useEffect(() => {
    if (messages.length === 0) {
      return
    }
    const timeout = setTimeout(() => setMessages([]), 3000)
    return () => clearTimeout(timeout)
  }, [messages, setMessages])

  useEffect(() => {
    browser.storage.local
      .get(['private_key', 'protocol_handler', 'notifications'])
      .then(results => {
        if (results.private_key) {
          let prvKey = results.private_key
          let nsec = nip19.nsecEncode(hexToBytes(prvKey))
          setPrivKeyInput(nsec)
          setPrivKey(nsec)
        }
        if (results.protocol_handler) {
          setProtocolHandler(results.protocol_handler)
          setHandleNostrLinks(true)
          setShowProtocolHandlerHelp(false)
        }
        if (results.notifications) {
          setNotifications(true)
        }
      })
  }, [])

  useEffect(() => {
    loadPermissions()
  }, [])

  async function loadPermissions() {
    let {policies = {}} = await browser.storage.local.get('policies')
    let list = []

    Object.entries(policies).forEach(([host, accepts]) => {
      Object.entries(accepts).forEach(([accept, types]) => {
        Object.entries(types).forEach(([type, {conditions, created_at}]) => {
          list.push({
            host,
            type,
            accept,
            conditions,
            created_at
          })
        })
      })
    })

    setPermissions(list)
  }

  return (
    <>
      <h1 style={{fontSize: '25px', marginBlockEnd: '0px'}}>nos2x</h1>
      <p style={{marginBlockStart: '0px'}}>nostr signer extension</p>
      <h2 style={{marginBlockStart: '20px', marginBlockEnd: '5px'}}>options</h2>
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: 'fit-content'
        }}
      >
        <div>
          <div>private key:&nbsp;</div>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type={hidingPrivateKey ? 'password' : 'text'}
                style={{width: '600px'}}
                value={privKeyInput}
                onChange={handleKeyChange}
              />
              {privKeyInput === '' && (
                <button onClick={generate}>generate</button>
              )}
              {privKeyInput && hidingPrivateKey && (
                <>
                  {askPassword !== 'encrypt/display' && (
                    <button onClick={() => hidePrivateKey(false)}>
                      show key
                    </button>
                  )}
                  <button onClick={() => setAskPassword('encrypt/display')}>
                    show key encrypted
                  </button>
                </>
              )}

              {privKeyInput && !hidingPrivateKey && (
                <button onClick={hideAndResetKeyInput}>hide key</button>
              )}
            </div>
            {privKeyInput &&
              !privKeyInput.startsWith('ncryptsec1') &&
              !isKeyValid() && (
                <div style={{color: 'red'}}>private key is invalid!</div>
              )}
            {!hidingPrivateKey &&
              privKeyInput !== '' &&
              (privKeyInput.startsWith('ncryptsec1') || isKeyValid()) && (
                <div
                  style={{
                    height: 'auto',
                    maxWidth: 256,
                    width: '100%',
                    marginTop: '5px'
                  }}
                >
                  <QRCode
                    size={256}
                    style={{height: 'auto', maxWidth: '100%', width: '100%'}}
                    value={privKeyInput.toUpperCase()}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              )}
          </div>
        </div>
        {askPassword && (
          <div>
            <div>password:&nbsp;</div>
            <div
              style={{
                marginLeft: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <form
                style={{display: 'flex', flexDirection: 'row', gap: '10px'}}
              >
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                  style={{width: '150px'}}
                />
                {askPassword === 'decrypt/save' ? (
                  <button
                    onClick={decryptPrivateKeyAndSave}
                    disabled={!password}
                  >
                    decrypt key
                  </button>
                ) : askPassword === 'encrypt/display' ? (
                  <button
                    onClick={ev => {
                      console.log('gah')
                      encryptPrivateKeyAndDisplay(ev)
                    }}
                    disabled={!password}
                  >
                    encrypt and show key
                  </button>
                ) : (
                  'jaksbdkjsad'
                )}
              </form>
            </div>
          </div>
        )}
        <div>
          <div>nosta.me:&nbsp;</div>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{display: 'flex', gap: '10px'}}>
              <button
                onClick={() => {
                  let {data} = nip19.decode(privKey)
                  let pub = getPublicKey(data)
                  let npub = nip19.npubEncode(pub)
                  window.open('https://nosta.me/' + npub)
                }}
                style={{cursor: 'pointer'}}
              >
                browse your profile
              </button>
              <button
                onClick={() => window.open('https://nosta.me/login/options')}
                style={{cursor: 'pointer'}}
              >
                edit your profile
              </button>
            </div>
          </div>
        </div>
        <div>
          <label style={{display: 'flex', alignItems: 'center'}}>
            <div>
              handle{' '}
              <span style={{padding: '2px', background: 'silver'}}>nostr:</span>{' '}
              links:
            </div>
            <input
              type="checkbox"
              checked={handleNostrLinks}
              onChange={changeHandleNostrLinks}
            />
          </label>
          <div style={{marginLeft: '10px'}}>
            {handleNostrLinks && (
              <div>
                <div style={{display: 'flex'}}>
                  <input
                    placeholder="url template"
                    value={protocolHandler}
                    onChange={handleChangeProtocolHandler}
                    style={{width: '680px', maxWidth: '90%'}}
                  />
                  {!showProtocolHandlerHelp && (
                    <button onClick={changeShowProtocolHandlerHelp}>?</button>
                  )}
                </div>
                {showProtocolHandlerHelp && (
                  <pre>{`
    {raw} = anything after the colon, i.e. the full nip19 bech32 string
    {hex} = hex pubkey for npub or nprofile, hex event id for note or nevent
    {p_or_e} = "p" for npub or nprofile, "e" for note or nevent
    {u_or_n} = "u" for npub or nprofile, "n" for note or nevent
    {relay0} = first relay in a nprofile or nevent
    {relay1} = second relay in a nprofile or nevent
    {relay2} = third relay in a nprofile or nevent
    {hrp} = human-readable prefix of the nip19 string

    examples:
      - https://njump.me/{raw}
      - https://snort.social/{raw}
      - https://nostr.band/{raw}
                `}</pre>
                )}
              </div>
            )}
          </div>
        </div>
        <label style={{display: 'flex', alignItems: 'center'}}>
          show notifications when permissions are used:
          <input
            type="checkbox"
            checked={showNotifications}
            onChange={handleNotifications}
          />
        </label>
        <button
          disabled={!unsavedChanges.length}
          onClick={saveChanges}
          style={{padding: '5px 20px'}}
        >
          save
        </button>
        <div style={{fontSize: '120%'}}>
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
      <div>
        <h2>permissions</h2>
        {!!policies.length && (
          <div style={{display: 'flex'}}>
            <table>
              <thead>
                <tr>
                  <th>domain</th>
                  <th>permission</th>
                  <th>answer</th>
                  <th>conditions</th>
                  <th>since</th>
                  <th>revoke</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(
                  ({host, type, accept, conditions, created_at}, index) => (
                    <tr key={host + type + accept + JSON.stringify(conditions)}>
                      <td>{host}</td>
                      <td>{type}</td>
                      <td>{accept === 'true' ? 'allow' : 'deny'}</td>
                      <td>
                        {conditions.kinds
                          ? `kinds: ${Object.keys(conditions.kinds).join(', ')}`
                          : 'always'}
                      </td>
                      <td>
                        {new Date(created_at * 1000)
                          .toISOString()
                          .split('.')[0]
                          .split('T')
                          .join(' ')}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(index)}
                          onChange={() => handleSelect(index)}
                          data-host={host}
                          data-accept={accept}
                          data-type={type}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            {selectedItems.length > 0 ? (
              <button
                style={{marginLeft: '0.5rem'}}
                onClick={handleMultiRevoke}
              >
                revoke
              </button>
            ) : null}
          </div>
        )}
        {!policies.length && (
          <div style={{marginTop: '5px'}}>
            no permissions have been granted yet
          </div>
        )}
      </div>
    </>
  )

  async function hideAndResetKeyInput() {
    setPrivKeyInput(privKey)
    hidePrivateKey(true)
  }

  async function handleKeyChange(e) {
    let key = e.target.value.toLowerCase().trim()
    setPrivKeyInput(key)

    try {
      let bytes = hexToBytes(key)
      if (bytes.length === 32) {
        key = nip19.nsecEncode(bytes)
        setPrivKeyInput(key)
      }
    } catch (err) {
      /***/
    }

    if (key.startsWith('ncryptsec1')) {
      // we won't save an encrypted key, will wait for the password
      setAskPassword('decrypt/save')
      return
    }

    try {
      // we will only save a key that is a valid nsec
      if (nip19.decode(key).type === 'nsec') {
        addUnsavedChanges('private_key')
      }
    } catch (err) {
      /***/
    }
  }

  async function generate() {
    setPrivKeyInput(nip19.nsecEncode(generateSecretKey()))
    addUnsavedChanges('private_key')
  }

  function encryptPrivateKeyAndDisplay(ev) {
    ev.preventDefault()

    try {
      let {data} = nip19.decode(privKeyInput)
      let encrypted = encrypt(data, password, 16, 0x00)
      setPrivKeyInput(encrypted)
      hidePrivateKey(false)
      setAskPassword(null)
    } catch (e) {
      showMessage(e.message)
    }
  }

  function decryptPrivateKeyAndSave(ev) {
    ev.preventDefault()

    try {
      let decrypted = decrypt(privKeyInput, password)
      setPrivKeyInput(nip19.nsecEncode(decrypted))
      browser.storage.local.set({
        private_key: bytesToHex(decrypted)
      })

      setTimeout(() => {
        setAskPassword(null)
      }, 2000)
    } catch (e) {
      showMessage(e.message)
    }
  }

  async function saveKey() {
    if (!isKeyValid()) {
      showMessage('PRIVATE KEY IS INVALID! did not save private key.')
      return
    }
    let hexOrEmptyKey = privKeyInput
    try {
      let {type, data} = nip19.decode(privKeyInput)
      if (type === 'nsec') hexOrEmptyKey = bytesToHex(data)
    } catch (_) {}
    await browser.storage.local.set({
      private_key: hexOrEmptyKey
    })
    if (hexOrEmptyKey !== '') {
      setPrivKeyInput(nip19.nsecEncode(hexToBytes(hexOrEmptyKey)))
    }
    showMessage('saved private key!')
  }

  function isKeyValid() {
    if (privKeyInput === '') return true
    try {
      if (nip19.decode(privKeyInput).type === 'nsec') return true
    } catch (_) {}
    return false
  }

  async function handleSelect(index) {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index))
    } else {
      setSelectedItems([...selectedItems, index])
    }
  }

  function handleNotifications() {
    setNotifications(!showNotifications)
    addUnsavedChanges('notifications')
    if (!showNotifications) requestBrowserNotificationPermissions()
  }

  async function handleMultiRevoke() {
    for (let index of selectedItems) {
      let {host, accept, type} = policies[index]
      await removePermissions(host, accept, type)
    }

    showMessage('removed selected policies')
    loadPermissions()
    setSelectedItems([])
  }

  async function requestBrowserNotificationPermissions() {
    let granted = await browser.permissions.request({
      permissions: ['notifications']
    })
    if (!granted) setNotifications(false)
  }

  async function saveNotifications() {
    await browser.storage.local.set({notifications: showNotifications})
    showMessage('saved notifications!')
  }

  function changeShowProtocolHandlerHelp() {
    setShowProtocolHandlerHelp(true)
  }

  function changeHandleNostrLinks() {
    if (handleNostrLinks) {
      setProtocolHandler('')
      addUnsavedChanges('protocol_handler')
    } else setShowProtocolHandlerHelp(true)
    setHandleNostrLinks(!handleNostrLinks)
  }

  function handleChangeProtocolHandler(e) {
    setProtocolHandler(e.target.value)
    addUnsavedChanges('protocol_handler')
  }

  async function saveNostrProtocolHandlerSettings() {
    await browser.storage.local.set({protocol_handler: protocolHandler})
    showMessage('saved protocol handler!')
  }

  function addUnsavedChanges(section) {
    setUnsavedChanges(currentUnsavedChanges =>
      currentUnsavedChanges.includes(section)
        ? currentUnsavedChanges
        : [...currentUnsavedChanges, section]
    )
  }

  async function saveChanges() {
    for (let section of unsavedChanges) {
      switch (section) {
        case 'private_key':
          await saveKey()
          break
        case 'protocol_handler':
          await saveNostrProtocolHandlerSettings()
          break
        case 'notifications':
          await saveNotifications()
          break
      }
    }
    setUnsavedChanges([])
  }
}

createRoot(document.getElementById('main')).render(<Options />)
