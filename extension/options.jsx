import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { getPublicKey } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import { decrypt, encrypt } from 'nostr-tools/nip49'
import { generateSecretKey } from 'nostr-tools/pure'
import qrcodeParser from 'qrcode-parser'
import React, { useCallback, useEffect, useState } from 'react'
import { render } from 'react-dom'
import QRCode from 'react-qr-code'
import QrReader from 'react-qr-scanner'
import browser, { i18n } from 'webextension-polyfill'
import { removePermissions } from './common'

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
  let [qrcodeScanned, setQrCodeScanned] = useState(null)
  let [scanning, setScanning] = useState(false)
  let [warningMessage, setWarningMessage] = useState('')

  const showMessage = (msg) => {
    setMessages((oldMessages) => [...oldMessages, msg])
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
    if (qrcodeScanned) {
      if (qrcodeScanned.startsWith('ncryptsec1')) {
        setPrivKeyInput(qrcodeScanned)
        setAskPassword('decrypt/save')
      } else if (qrcodeScanned.startsWith('nsec1')) {
        setPrivKeyInput(qrcodeScanned)
        addUnsavedChanges('private_key')
        setWarningMessage(i18n.getMessage('warn_use_crypt_nsec'))
      } else if (/^[a-f0-9]+$/.test(qrcodeScanned)) {
        setPrivKeyInput(nip19.nsecEncode(hexToBytes(qrcodeScanned)))
        addUnsavedChanges('private_key')
        setWarningMessage(i18n.getMessage('warn_use_crypt_sec'))
      }
    }
  }, [qrcodeScanned])

  useEffect(() => {
    if (privKeyInput) {
      setScanning(false)
    }
  }, [privKeyInput])

  useEffect(() => {
    setTimeout(() => setWarningMessage(''), 5000)
  }, [warningMessage])

  async function loadQrCodeFromFile(type = 'image/*') {
    setScanning(false)
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', type)
    input.click()

    const file = await new Promise(resolve => {
      input.addEventListener('change', () => {
        const file = input.files && input.files[0] || null
        resolve(file)
        input.value = null
      })
    })

    if (!file) {
      return Promise.resolve(null)
    }

    const result = await qrcodeParser(file)
    setQrCodeScanned(result.toLowerCase())
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  async function loadPermissions() {
    let { policies = {} } = await browser.storage.local.get('policies')
    let list = []

    Object.entries(policies).forEach(([host, accepts]) => {
      Object.entries(accepts).forEach(([accept, types]) => {
        Object.entries(types).forEach(([type, { conditions, created_at }]) => {
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


  const [isMulti, setIsMulti] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleMulti = () => {
    setIsMulti(!isMulti);
  };

  const handleSelect = (index) => {
    if (isMulti) {
      if (selectedItems.includes(index)) {
        setSelectedItems(selectedItems.filter(i => i !== index));
      } else {
        setSelectedItems([...selectedItems, index]);
      }
    } else {
      setSelectedItems([index]);
    }
  };
  const handleMultiRevoke = async () => {
    if (
      window.confirm(i18n.getMessage("cnfrm_revoke_policy"))
    ) {

      for (let index of selectedItems) {
        let { host, accept, type } = policies[index]

        await removePermissions(host, accept, type)
      }

      showMessage(i18n.getMessage("removed_sel_policies"))
      loadPermissions()
      setSelectedItems([])
    }
  }

  return (
    <>
      <h1 style={{ fontSize: '25px', marginBlockEnd: '0px' }}>nos2x</h1>
      <p style={{ marginBlockStart: '0px' }}>{i18n.getMessage("description")}</p>
      <h2 style={{ marginBlockStart: '20px', marginBlockEnd: '5px' }}>{i18n.getMessage("options")}</h2>
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
          <div>{i18n.getMessage("privatekey")}:&nbsp;</div>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type={hidingPrivateKey ? 'password' : 'text'}
                style={{ width: '600px' }}
                value={privKeyInput}
                onChange={handleKeyChange}
              />
              {privKeyInput === '' && (
                <>
                  <button onClick={generate}>{i18n.getMessage("generate")}</button>
                  <button onClick={() => setScanning(true)}>{i18n.getMessage("scan_qr")}</button>
                  <button onClick={loadQrCodeFromFile}>{i18n.getMessage("load_qr")}</button>
                </>
              )}
              {privKeyInput && hidingPrivateKey && (
                <>
                  {askPassword !== 'encrypt/display' && (
                    <button onClick={() => hidePrivateKey(false)}>
                      {i18n.getMessage("show_key")}
                    </button>
                  )}
                  <button onClick={() => setAskPassword('encrypt/display')}>
                    {i18n.getMessage("show_key_enc")}
                  </button>
                </>
              )}

              {privKeyInput && !hidingPrivateKey && (
                <button onClick={hideAndResetKeyInput}>{i18n.getMessage("hide_key")}</button>
              )}
            </div>
            {privKeyInput &&
              !privKeyInput.startsWith('ncryptsec1') &&
              !isKeyValid() && (
                <div style={{ color: 'red' }}>{i18n.getMessage("priv_invalid")}</div>
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
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={privKeyInput.toUpperCase()}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              )}
            {scanning && (
              <QrReader
                style={{
                  height: 240,
                  width: 320,
                }}
                onError={error => {
                  setErrorMessage(i18n.getMessage("invalid_qr"))
                  console.error(error)
                  setScanning(false)
                }}
                onScan={scanned => setQrCodeScanned(scanned && scanned.text || null)}
              ></QrReader>
            )}
          </div>
          {warningMessage && <div style={{ color: 'red', marginTop: '10px' }}>{warningMessage}</div>}
        </div>
        {askPassword && (
          <div>
            <div>{i18n.getMessage("passwd")}:&nbsp;</div>
            <div
              style={{
                marginLeft: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <form
                style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}
              >
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                  style={{ width: '150px' }}
                />
                {askPassword === 'decrypt/save' ? (
                  <button
                    onClick={decryptPrivateKeyAndSave}
                    disabled={!password}
                  >
                    {i18n.getMessage("dec_key")}
                  </button>
                ) : askPassword === 'encrypt/display' ? (
                  <button
                    onClick={ev => {
                      console.log('gah')
                      encryptPrivateKeyAndDisplay(ev)
                    }}
                    disabled={!password}
                  >
                    {i18n.getMessage("enc_key")}
                  </button>
                ) : (
                  'jaksbdkjsad'
                )}
              </form>

              {successMessage && (
                <div style={{ color: 'green' }}>{successMessage}</div>
              )}
              {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  let { data } = nip19.decode(privKey)
                  let pub = getPublicKey(data)
                  let npub = nip19.npubEncode(pub)
                  window.open('https://nosta.me/' + npub)
                }}
                style={{ cursor: 'pointer' }}
              >
                {i18n.getMessage("browse_prof")}
              </button>
              <button
                onClick={() => window.open('https://nosta.me/login/options')}
                style={{ cursor: 'pointer' }}
              >
                {i18n.getMessage("edit_prof")}
              </button>
            </div>
          </div>
        </div>
        <div>
          <div>{i18n.getMessage("pref_relays")}:</div>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px'
            }}
          >
            {relays.map(({ url, policy }, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <input
                  style={{ width: '400px' }}
                  value={url}
                  onChange={changeRelayURL.bind(null, i)}
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    {i18n.getMessage("read")}
                    <input
                      type="checkbox"
                      checked={policy.read}
                      onChange={toggleRelayPolicy.bind(null, i, 'read')}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    {i18n.getMessage("write")}
                    <input
                      type="checkbox"
                      checked={policy.write}
                      onChange={toggleRelayPolicy.bind(null, i, 'write')}
                    />
                  </label>
                </div>
                <button onClick={removeRelay.bind(null, i)}>{i18n.getMessage("remove")}</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input
                style={{ width: '400px' }}
                value={newRelayURL}
                onChange={e => setNewRelayURL(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addNewRelay()
                }}
              />
              <button disabled={!newRelayURL} onClick={addNewRelay}>
                {i18n.getMessage("add_relay")}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              {i18n.getMessage("handle")}{' '}
              <span style={{ padding: '2px', background: 'silver' }}>nostr:</span>{' '}
              {i18n.getMessage("links")}:
            </div>
            <input
              type="checkbox"
              checked={handleNostrLinks}
              onChange={changeHandleNostrLinks}
            />
          </label>
          <div style={{ marginLeft: '10px' }}>
            {handleNostrLinks && (
              <div>
                <div style={{ display: 'flex' }}>
                  <input
                    placeholder={i18n.getMessage("url_temp")}
                    value={protocolHandler}
                    onChange={handleChangeProtocolHandler}
                    style={{ width: '680px', maxWidth: '90%' }}
                  />
                  {!showProtocolHandlerHelp && (
                    <button onClick={changeShowProtocolHandlerHelp}>?</button>
                  )}
                </div>
                {showProtocolHandlerHelp && (
                  <pre>{`
    {raw} = ${i18n.getMessage("link_raw")}
    {hex} = ${i18n.getMessage("link_hex")}
    {p_or_e} = ${i18n.getMessage("link_p_or_e")}
    {u_or_n} = ${i18n.getMessage("link_u_or_n")}
    {relay0} = ${i18n.getMessage("link_relay0")}
    {relay1} = ${i18n.getMessage("link_relay1")}
    {relay2} = ${i18n.getMessage("link_relay2")}
    {hrp} = ${i18n.getMessage("link_hrp")}

    ${i18n.getMessage("examples")}:
      - https://njump.me/{raw}
      - https://snort.social/{raw}
      - https://nostr.band/{raw}
                `}</pre>
                )}
              </div>
            )}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          {i18n.getMessage("show_notif")}:
          <input
            type="checkbox"
            checked={showNotifications}
            onChange={handleNotifications}
          />
        </label>
        <button
          disabled={!unsavedChanges.length}
          onClick={saveChanges}
          style={{ padding: '5px 20px' }}
        >
          {i18n.getMessage("save")}
        </button>
        <div style={{ fontSize: '120%' }}>
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
      <div>
        <h2>{i18n.getMessage("perms")}</h2>
        {!!policies.length && (
          <>
            <table>
              <thead>
                <tr>
                  <th>{i18n.getMessage("domain")}</th>
                  <th>{i18n.getMessage("perm")}</th>
                  <th>{i18n.getMessage("answer")}</th>
                  <th>{i18n.getMessage("cond")}</th>
                  <th>{i18n.getMessage("since")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {policies.map(({ host, type, accept, conditions, created_at }, index) => (
                  <tr key={host + type + accept + JSON.stringify(conditions)}>
                    <td>{host}</td>
                    <td>{type}</td>
                    <td>{accept === 'true' ? i18n.getMessage("allow") : i18n.getMessage("deny")}</td>
                    <td>
                      {conditions.kinds
                        ? i18n.getMessage("kinds") + `: ${Object.keys(conditions.kinds).join(', ')}`
                        : i18n.getMessage("always")}
                    </td>
                    <td>
                      {new Date(created_at * 1000)
                        .toISOString()
                        .split('.')[0]
                        .split('T')
                        .join(' ')}
                    </td>
                    <td>
                      {isMulti ? (

                        <input
                          type="checkbox"
                          checked={selectedItems.includes(index)}
                          onChange={() => handleSelect(index)}
                          data-host={host}
                          data-accept={accept}
                          data-type={type}
                        />
                      ) : (

                        <button
                          onClick={handleRevoke}
                          data-host={host}
                          data-accept={accept}
                          data-type={type}
                        >
                          {i18n.getMessage("revoke")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', alignItems: 'center' }}>{i18n.getMessage("allow_multi_sel")}: <input type="checkbox" checked={isMulti} onChange={toggleMulti} />
              {isMulti && (
                <button onClick={handleMultiRevoke}>
                  {i18n.getMessage("revoke")}
                </button>
              )}</div></>
        )}
        {!policies.length && (
          <div style={{ marginTop: '5px' }}>
            {i18n.getMessage("no_perm_grant")}
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
    setScanning(false)
    setPrivKeyInput(nip19.nsecEncode(generateSecretKey()))
    addUnsavedChanges('private_key')
  }

  function encryptPrivateKeyAndDisplay(ev) {
    ev.preventDefault()

    try {
      let { data } = nip19.decode(privKeyInput)
      let encrypted = encrypt(data, password, 16, 0x00)
      setPrivKeyInput(encrypted)
      hidePrivateKey(false)

      setSuccessMessage(i18n.getMessage("enc_success"))
      setTimeout(() => {
        setAskPassword(null)
        setSuccessMessage('')
      }, 2000)
      setErrorMessage('')
    } catch (e) {
      setErrorMessage(i18n.getMessage("some_wrong"))
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
      setSuccessMessage(i18n.getMessage("dec_success"))

      setTimeout(() => {
        setAskPassword(null)
        setSuccessMessage('')
      }, 2000)
      setErrorMessage('')
    } catch (e) {
      setErrorMessage(i18n.getMessage("incorr_pass"))
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
      setSuccessMessage('')
    }
  }

  async function saveKey() {
    if (!isKeyValid()) {
      showMessage(i18n.getMessage("invalid_priv_didnt_save"))
      return
    }
    let hexOrEmptyKey = privKeyInput
    try {
      let { type, data } = nip19.decode(privKeyInput)
      if (type === 'nsec') hexOrEmptyKey = bytesToHex(data)
    } catch (_) { }
    await browser.storage.local.set({
      private_key: hexOrEmptyKey
    })
    if (hexOrEmptyKey !== '') {
      setPrivKeyInput(nip19.nsecEncode(hexToBytes(hexOrEmptyKey)))
    }
    showMessage(i18n.getMessage("saved_priv"))
  }

  function isKeyValid() {
    if (privKeyInput === '') return true
    try {
      if (nip19.decode(privKeyInput).type === 'nsec') return true
    } catch (_) { }
    return false
  }

  function changeRelayURL(i, ev) {
    setRelays([
      ...relays.slice(0, i),
      { url: ev.target.value, policy: relays[i].policy },
      ...relays.slice(i + 1)
    ])
    addUnsavedChanges('relays')
  }

  function toggleRelayPolicy(i, cat) {
    setRelays([
      ...relays.slice(0, i),
      {
        url: relays[i].url,
        policy: { ...relays[i].policy, [cat]: !relays[i].policy[cat] }
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
    setRelays([
      ...relays,
      {
        url: newRelayURL,
        policy: { read: true, write: true }
      },
    ])
    addUnsavedChanges('relays')
    setNewRelayURL('')
  }

  async function handleRevoke(e) {
    let { host, accept, type } = e.target.dataset
    if (
      window.confirm(
        `${i18n.getMessage('cnfrm_revoke_prefix')}${accept === 'true' ? i18n.getMessage('cnfrm_revoke_accept') : i18n.getMessage('cnfrm_revoke_deny')
        } ${type}${i18n.getMessage('cnfrm_revoke_middle')}${host}${i18n.getMessage('cnfrm_revoke_suffix')}`
      )
    ) {
      await removePermissions(host, accept, type)
      showMessage(i18n.getMessage("removed_policy"))
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
    await browser.storage.local.set({ notifications: showNotifications })
    showMessage(i18n.getMessage("saved_notif"))
  }

  async function saveRelays() {
    await browser.storage.local.set({
      relays: Object.fromEntries(
        relays
          .filter(({ url }) => url.trim() !== '')
          .map(({ url, policy }) => [url.trim(), policy])
      )
    })
    showMessage(i18n.getMessage("saved_relays"))
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
    await browser.storage.local.set({ protocol_handler: protocolHandler })
    showMessage(i18n.getMessage("saved_handler"))
  }

  function addUnsavedChanges(section) {
    setUnsavedChanges((currentUnsavedChanges) => currentUnsavedChanges.includes(section) ? currentUnsavedChanges : [...currentUnsavedChanges, section])
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
