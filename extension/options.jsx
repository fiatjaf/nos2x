import browser from 'webextension-polyfill'
import React, {useState, useCallback, useEffect} from 'react'
import {render} from 'react-dom'
import {generatePrivateKey, nip19} from 'nostr-tools'
import QRCode from 'react-qr-code'

import {removePermissions} from './common'

function Options() {
  let [privKey, setPrivKey] = useState('')
  let [relays, setRelays] = useState([])
  let [newRelayURL, setNewRelayURL] = useState('')
  let [policies, setPermissions] = useState()
  let [protocolHandler, setProtocolHandler] = useState(null)
  let [hidingPrivateKey, hidePrivateKey] = useState(true)
  let [message, setMessage] = useState('')

  const showMessage = useCallback(msg => {
    setMessage(msg)
    setTimeout(setMessage, 3000)
  })

  useEffect(() => {
    browser.storage.local
      .get(['private_key', 'relays', 'protocol_handler'])
      .then(results => {
        if (results.private_key) {
          setPrivKey(nip19.nsecEncode(results.private_key))
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
            accept: {true: 'allow', false: 'deny'}[accept],
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
      <h1>nos2x</h1>
      <p>nostr signer extension</p>
      <h2>options</h2>
      <div style={{marginBottom: '10px'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span>preferred relays:</span>
          <button style={{marginLeft: '20px'}} onClick={saveRelays}>
            save
          </button>
        </div>
        <div style={{marginLeft: '10px'}}>
          {relays.map(({url, policy}, i) => (
            <div key={i} style={{display: 'flex'}}>
              <input
                style={{marginRight: '10px', width: '400px'}}
                value={url}
                onChange={changeRelayURL.bind(null, i)}
              />
              <label>
                read
                <input
                  type="checkbox"
                  checked={policy.read}
                  onChange={toggleRelayPolicy.bind(null, i, 'read')}
                />
              </label>
              <label>
                write
                <input
                  type="checkbox"
                  checked={policy.write}
                  onChange={toggleRelayPolicy.bind(null, i, 'write')}
                />
              </label>
            </div>
          ))}
          <div style={{display: 'flex'}}>
            <input
              style={{width: '400px'}}
              value={newRelayURL}
              onChange={e => setNewRelayURL(e.target.value)}
              onBlur={addNewRelay}
            />
          </div>
        </div>
      </div>
      <div style={{marginBottom: '10px'}}>
        <label>
          <div>private key:&nbsp;</div>
          <div style={{marginLeft: '10px'}}>
            {!hidingPrivateKey && (
              <div
                style={{
                  height: 'auto',
                  maxWidth: 256,
                  width: '100%'
                }}
              >
                <QRCode
                  size={256}
                  style={{height: 'auto', maxWidth: '100%', width: '100%'}}
                  value={privKey.toUpperCase()}
                  viewBox={`0 0 256 256`}
                />
              </div>
            )}

            <div style={{display: 'flex'}}>
              <input
                type={hidingPrivateKey ? 'password' : 'text'}
                style={{width: '600px'}}
                value={privKey}
                onChange={handleKeyChange}
                onFocus={() => hidePrivateKey(false)}
                onBlur={() => hidePrivateKey(true)}
              />
              {privKey === '' && <button onClick={generate}>generate</button>}
            </div>

            <button disabled={!isKeyValid()} onClick={saveKey}>
              save
            </button>
          </div>
        </label>
        {policies?.length > 0 && (
          <>
            <h2>policies</h2>
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
                {policies.map(
                  ({host, type, accept, conditions, created_at}) => (
                    <tr key={host + type + accept + JSON.stringify(conditions)}>
                      <td>{host}</td>
                      <td>{type}</td>
                      <td>{accept}</td>
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
                  )
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
      <div>
        <h2>
          handle{' '}
          <span style={{padding: '2px', background: 'silver'}}>nostr:</span>{' '}
          links:
        </h2>
        <div style={{marginLeft: '10px'}}>
          <div>
            <label>
              <input
                type="radio"
                name="ph"
                value="no"
                checked={protocolHandler === null}
                onChange={handleChangeProtocolHandler}
              />{' '}
              no
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="ph"
                value="yes"
                checked={protocolHandler !== null}
                onChange={handleChangeProtocolHandler}
              />
              yes
            </label>
          </div>
          {protocolHandler !== null && (
            <div>
              <input
                placeholder="url template"
                value={protocolHandler}
                onChange={handleChangeProtocolHandler}
                style={{width: '680px', maxWidth: '90%'}}
              />
              <pre>{`
  {hex} = hex pubkey for npub or nprofile, hex event id for note or nevent
  {p_or_e} = "p" for npub or nprofile, "e" for note or nevent
  {u_or_n} = "u" for npub or nprofile, "n" for note or nevent
  {relay0} = first relay in a nprofile or nevent
  {relay1} = second relay in a nprofile or nevent
  {relay2} = third relay in a nprofile or nevent
  {raw} = anything after the colon, i.e. the full nip19 bech32 string
  {hrp} = human-readable prefix of the nip19 string

  examples:
    - https://nostr.guru/{p_or_e}/{hex}
    - https://brb.io/{u_or_n}/{hex}
    - https://notes.blockcore.net/{p_or_e}/{hex}
              `}</pre>
            </div>
          )}
          <button
            style={{marginTop: '10px'}}
            onClick={saveNostrProtocolHandlerSettings}
          >
            save
          </button>
        </div>
      </div>
      <div style={{marginTop: '12px', fontSize: '120%'}}>{message}</div>
    </>
  )

  async function handleKeyChange(e) {
    let key = e.target.value.toLowerCase().trim()
    setPrivKey(key)
  }

  async function generate() {
    setPrivKey(nip19.nsecEncode(generatePrivateKey()))
  }

  async function saveKey() {
    if (!isKeyValid()) return

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

    showMessage('saved private key!')
  }

  function isKeyValid() {
    if (privKey === '') return true
    if (privKey.match(/^[a-f0-9]{64}$/)) return true
    try {
      if (nip19.decode(privKey).type === 'nsec') return true
    } catch (_) {}
    return false
  }

  function changeRelayURL(i, ev) {
    setRelays([
      ...relays.slice(0, i),
      {url: ev.target.value, policy: relays[i].policy},
      ...relays.slice(i + 1)
    ])
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
  }

  function addNewRelay() {
    relays.push({
      url: newRelayURL,
      policy: {read: true, write: true}
    })
    setRelays(relays)
    setNewRelayURL('')
  }

  async function handleRevoke(e) {
    let {host, accept, type} = e.target.dataset
    if (
      window.confirm(
        `revoke all ${
          accept ? 'accept' : 'deny'
        } ${type} policies from ${host}?`
      )
    ) {
      await removePermissions(host, accept, type)
      showMessage('removed policies')
      loadPermissions()
    }
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

  function handleChangeProtocolHandler(e) {
    if (e.target.type === 'text') setProtocolHandler(e.target.value)
    else
      switch (e.target.value) {
        case 'no':
          setProtocolHandler(null)
          break
        case 'yes':
          setProtocolHandler('')
          break
      }
  }

  async function saveNostrProtocolHandlerSettings() {
    await browser.storage.local.set({protocol_handler: protocolHandler})
    showMessage('saved protocol handler!')
  }
}

render(<Options />, document.getElementById('main'))
