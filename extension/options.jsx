import browser from 'webextension-polyfill'
import React, {useState, useCallback, useEffect} from 'react'
import {render} from 'react-dom'
import {normalizeRelayURL} from 'nostr-tools/relay'
import {useDebouncedCallback} from 'use-debounce'

import {getPermissionsString, readPermissions} from './common'

function Options() {
  let [key, setKey] = useState('')
  let [relays, setRelays] = useState([])
  let [newRelayURL, setNewRelayURL] = useState('')
  let [permissions, setPermissions] = useState()
  let [message, setMessage] = useState('')

  const showMessage = useCallback(msg => {
    setMessage(msg)
    setTimeout(setMessage, 3000)
  })

  const saveRelays = useDebouncedCallback(async () => {
    await browser.storage.local.set({
      relays: Object.fromEntries(
        relays
          .filter(({url}) => url.trim() !== '')
          .map(({url, policy}) => [url.trim(), policy])
      )
    })
    showMessage('saved relays!')
  }, 700)

  useEffect(() => {
    saveRelays()
  }, [relays])

  useEffect(() => {
    browser.storage.local.get(['private_key', 'relays']).then(results => {
      if (results.private_key) setKey(results.private_key)
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
    })
  }, [])

  useEffect(() => {
    readPermissions().then(permissions => {
      setPermissions(
        Object.entries(permissions).map(
          ([host, {level, condition, created_at}]) => ({
            host,
            level,
            condition,
            created_at
          })
        )
      )
    })
  }, [])

  return (
    <>
      <h1>nos2x</h1>
      <p>nostr signer extension</p>
      <h2>options</h2>
      <div style={{marginBottom: '10px'}}>
        <div>preferred relays:</div>
        <div style={{marginLeft: '10px'}}>
          {relays.map(({url, policy}, i) => (
            <div key={i} style={{display: 'flex'}}>
              <input
                style={{marginRight: '10px'}}
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
              value={newRelayURL}
              onChange={e => setNewRelayURL(e.target.value)}
              onBlur={addNewRelay}
            />
          </div>
        </div>
      </div>
      <div>
        <label>
          private key:&nbsp;
          <input value={key} onChange={handleKeyChange} />
        </label>
        {permissions?.length > 0 && (
          <>
            <h2>permissions</h2>
            <table>
              <thead>
                <tr>
                  <th>domain</th>
                  <th>permissions</th>
                  <th>condition</th>
                  <th>since</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(({host, level, condition, created_at}) => (
                  <tr key={host}>
                    <td>{host}</td>
                    <td>{getPermissionsString(level)}</td>
                    <td>{condition}</td>
                    <td>
                      {new Date(created_at * 1000)
                        .toISOString()
                        .split('.')[0]
                        .split('T')
                        .join(' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <div style={{marginTop: '12px', fontSize: '120%'}}>{message}</div>
    </>
  )

  async function handleKeyChange(e) {
    let key = e.target.value.toLowerCase().trim()
    setKey(key)

    if (key.match(/^[a-f0-9]{64}$/) || key === '') {
      await browser.storage.local.set({
        private_key: key
      })
      showMessage('saved private key!')
    }
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
      url: normalizeRelayURL(newRelayURL),
      policy: {read: true, write: true}
    })
    setRelays(relays)
    setNewRelayURL('')
  }
}

render(<Options />, document.getElementById('main'))
