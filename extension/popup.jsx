import browser from 'webextension-polyfill'
import {render} from 'react-dom'
import {getPublicKey, nip19} from 'nostr-tools'
import React, {useState, useRef, useEffect} from 'react'
import QRCode from 'react-qr-code'

function Popup() {
  let [pubKey, setPubKey] = useState('')
  let [privKey, setPrivKey] = useState('')
  let keys = useRef([])
  let [showQR, setShowQR] = useState('')

  const QrIcon = () => (
      <svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
           stroke="currentColor" className="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/>
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"/>
      </svg>
  )

  useEffect(() => {
    browser.storage.local.get(['private_key', 'relays']).then(results => {
      setPrivKey(results.private_key)

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
      <>
        <h2>nos2x</h2>
        {pubKey === null ? (
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
                    width: '200px'
                  }}
              >
            <code>{pubKey}</code>
          </pre>

              <div style={{float: 'left', marginRight: '30px', marginBottom: '20px'}}>
                <a onClick={() => setShowQR('pub')}>
                  <QrIcon></QrIcon> PUB
                </a>
              </div>

              <div style={{float: 'left', marginRight: '30px', marginBottom: '20px'}}>
                <a onClick={() => setShowQR('priv')}>
                  <QrIcon></QrIcon> PRIV
                </a>
              </div>

              { showQR && (
                  <div id={'qrCodeDiv'} style={{ height: 'auto', margin: '0 auto', maxWidth: 256, width: '100%', marginTop: '50px' }}>
                    {showQR === 'priv' ? (<p>PRIVATE KEY</p>) : (<p>PUBLIC KEY</p>)}
                    <QRCode
                        size={256}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        value={showQR === 'priv' ? privKey : pubKey}
                        viewBox={`0 0 256 256`}
                    />
                  </div>
              )}
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
