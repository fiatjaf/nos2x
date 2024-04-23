import browser from 'webextension-polyfill'
import React, {useState, useCallback, useEffect} from 'react'
import {render} from 'react-dom'
import {generateSecretKey} from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import {decrypt, encrypt} from 'nostr-tools/nip49'
import QRCode from 'react-qr-code'
import {hexToBytes, bytesToHex} from '@noble/hashes/utils'

import {removePermissions} from './common'
import {getPublicKey} from 'nostr-tools'

function Options() {
  let [privKey, setPrivKey] = useState(null)
  let [privKeyInput, setPrivKeyInput] = useState('')
  let [askPassword, setAskPassword] = useState(null)
  let [password, setPassword] = useState('')
  let [errorMessage, setErrorMessage] = useState('')
  let [successMessage, setSuccessMessage] = useState('')
  let [relays, setRelays] = useState([])
  let [newRelayURL, setNewRelayURL] = useState('')
  let [policies, setPermissions] = useState([])
  let [protocolHandler, setProtocolHandler] = useState('https://njump.me/{raw}')
  let [hidingPrivateKey, hidePrivateKey] = useState(true)
  let [showNotifications, setNotifications] = useState(false)
  let [messages, setMessages] = useState([])
  let [handleNostrLinks, setHandleNostrLinks] = useState(false)
  let [showProtocolHandlerHelp, setShowProtocolHandlerHelp] = useState(false)
  let [unsavedChanges, setUnsavedChanges] = useState([])

  const showMessage = useCallback(msg => {
    messages.push(msg)
    setMessages(messages)
    setTimeout(() => setMessages([]), 3000)
  })

  useEffect(() => {
    browser.storage.local
      .get(['private_key', 'relays', 'protocol_handler', 'notifications'])
      .then(results => {
        if (results.private_key) {
          let prvKey = results.private_key
          let nsec = nip19.nsecEncode(hexToBytes(prvKey))
          setPrivKeyInput(nsec)
          setPrivKey(nsec)
        }
        if (results.relays) {
          let relaysList = []
          for (let url in results.relays) {
            relaysList.push({
              url,
              policy: results.relays[url]
            })
          }
          setRelays(relaysList)
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

              {successMessage && (
                <div style={{color: 'green'}}>{successMessage}</div>
              )}
              {errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>}
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
          <div>preferred relays:</div>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px'
            }}
          >
            {relays.map(({url, policy}, i) => (
              <div
                key={i}
                style={{display: 'flex', alignItems: 'center', gap: '15px'}}
              >
                <input
                  style={{width: '400px'}}
                  value={url}
                  onChange={changeRelayURL.bind(null, i)}
                />
                <div style={{display: 'flex', gap: '5px'}}>
                  <label style={{display: 'flex', alignItems: 'center'}}>
                    read
                    <input
                      type="checkbox"
                      checked={policy.read}
                      onChange={toggleRelayPolicy.bind(null, i, 'read')}
                    />
                  </label>
                  <label style={{display: 'flex', alignItems: 'center'}}>
                    write
                    <input
                      type="checkbox"
                      checked={policy.write}
                      onChange={toggleRelayPolicy.bind(null, i, 'write')}
                    />
                  </label>
                </div>
                <button onClick={removeRelay.bind(null, i)}>remove</button>
              </div>
            ))}
            <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
              <input
                style={{width: '400px'}}
                value={newRelayURL}
                onChange={e => setNewRelayURL(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addNewRelay()
                }}
              />
              <button disabled={!newRelayURL} onClick={addNewRelay}>
                add relay
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
          <table>
            <thead>
              <tr>
                <th>domain</th>
                <th>permission</th>
                <th>answer</th>
                <th>conditions</th>
                <th>since</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {policies.map(({host, type, accept, conditions, created_at}) => (
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
                    <button
                      onClick={handleRevoke}
                      data-host={host}
                      data-accept={accept}
                      data-type={type}
                    >
                      revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      setSuccessMessage('encryption successful!')
      setTimeout(() => {
        setAskPassword(null)
        setSuccessMessage('')
      }, 2000)
      setErrorMessage('')
    } catch (e) {
      setErrorMessage('something is going wrong. please try again.')
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
      setSuccessMessage('')
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
      setSuccessMessage('decryption successful!')

      setTimeout(() => {
        setAskPassword(null)
        setSuccessMessage('')
      }, 2000)
      setErrorMessage('')
    } catch (e) {
      setErrorMessage('incorrect password. please try again.')
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
      setSuccessMessage('')
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

  function changeRelayURL(i, ev) {
    setRelays([
      ...relays.slice(0, i),
      {url: ev.target.value, policy: relays[i].policy},
      ...relays.slice(i + 1)
    ])
    addUnsavedChanges('relays')
  }

  function toggleRelayPolicy(i, cat) {
    setRelays([
      ...relays.slice(0, i),
      {
        url: relays[i].url,
        policy: {...relays[i].policy, [cat]: !relays[i].policy[cat]}
      },
      ...relays.slice(i + 1)
    ])
    addUnsavedChanges('relays')
  }

  function removeRelay(i) {
    setRelays([...relays.slice(0, i), ...relays.slice(i + 1)])
    addUnsavedChanges('relays')
  }

  function addNewRelay() {
    if (newRelayURL.trim() === '') return
    relays.push({
      url: newRelayURL,
      policy: {read: true, write: true}
    })
    setRelays(relays)
    addUnsavedChanges('relays')
    setNewRelayURL('')
  }

  async function handleRevoke(e) {
    let {host, accept, type} = e.target.dataset
    if (
      window.confirm(
        `revoke all ${
          accept === 'true' ? 'accept' : 'deny'
        } ${type} policies from ${host}?`
      )
    ) {
      await removePermissions(host, accept, type)
      showMessage('removed policies')
      loadPermissions()
    }
  }

  function handleNotifications() {
    setNotifications(!showNotifications)
    addUnsavedChanges('notifications')
    if (!showNotifications) requestBrowserNotificationPermissions()
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

  async function saveRelays() {
    await browser.storage.local.set({
      relays: Object.fromEntries(
        relays
          .filter(({url}) => url.trim() !== '')
          .map(({url, policy}) => [url.trim(), policy])
      )
    })
    showMessage('saved relays!')
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
        case 'relays':
          await saveRelays()
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

render(<Options />, document.getElementById('main'))
