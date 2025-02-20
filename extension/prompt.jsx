import browser from 'webextension-polyfill'
import {createRoot} from 'react-dom/client'
import React from 'react'

import {PERMISSION_NAMES} from './common'

function Prompt() {
  let qs = new URLSearchParams(location.search)
  let id = qs.get('id')
  let host = qs.get('host')
  let type = qs.get('type')
  let result = qs.get('result')
  let params, event
  try {
    params = JSON.parse(qs.get('params'))
    if (Object.keys(params).length === 0) params = null
    else if (params.event) event = params.event
  } catch (err) {
    params = null
  }

  return (
    <>
      <b style={{display: 'block', textAlign: 'center', fontSize: '200%'}}>
        {host}
      </b>{' '}
      <p style={{margin: 0}}>
        is requesting your permission to <b>{PERMISSION_NAMES[type]}:</b>
      </p>
      {params && (
        <div style={{width: '100%', maxHeight: '200px', overflowY: 'scroll'}}>
          <p style={{margin: 0}}>now acting on</p>
          <pre
            style={{
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            <code>{JSON.stringify(event || params, null, 2)}</code>
          </pre>
        </div>
      )}
      {result && (
        <div style={{width: '100%', maxHeight: '180px', overflowY: 'scroll'}}>
          <p style={{margin: 0}}>result:</p>
          <pre
            style={{
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            <code>{result}</code>
          </pre>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: '0.5rem'
        }}
      >
        {event?.kind === undefined && (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              true,
              {} // store this and answer true forever
            )}
          >
            authorize forever
          </button>
        )}
        {event?.kind !== undefined && (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              true,
              {kinds: {[event.kind]: true}} // store and always answer true for all events that match this condition
            )}
          >
            authorize kind {event.kind} forever
          </button>
        )}
        <button style={{marginTop: '5px'}} onClick={authorizeHandler(true)}>
          authorize just this
        </button>
        {event?.kind !== undefined ? (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              false,
              {kinds: {[event.kind]: true}} // idem
            )}
          >
            reject kind {event.kind} forever
          </button>
        ) : (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              false,
              {} // idem
            )}
          >
            reject forever
          </button>
        )}
        <button style={{marginTop: '5px'}} onClick={authorizeHandler(false)}>
          reject
        </button>
      </div>
    </>
  )

  function authorizeHandler(accept, conditions) {
    return function (ev) {
      ev.preventDefault()
      browser.runtime.sendMessage({
        prompt: true,
        id,
        host,
        type,
        accept,
        conditions
      })
    }
  }
}

createRoot(document.getElementById('main')).render(<Prompt />)
