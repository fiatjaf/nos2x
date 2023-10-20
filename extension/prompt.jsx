import browser from 'webextension-polyfill'
import {render} from 'react-dom'
import React from 'react'

import {PERMISSION_NAMES} from './common'

function Prompt() {
  let qs = new URLSearchParams(location.search)
  let id = qs.get('id')
  let host = qs.get('host')
  let type = qs.get('type')
  let params, event
  try {
    params = JSON.parse(qs.get('params'))
    if (Object.keys(params).length === 0) params = null
    else if (params.event) event = params.event
  } catch (err) {
    params = null
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <div c>
          <b style={{display: 'block', textAlign: 'center', fontSize: '200%'}}>
            {host}
          </b>{' '}
          <p>
            is requesting your permission to <b>{PERMISSION_NAMES[type]}:</b>
          </p>
        </div>
        {params && (
          <>
            <p>now acting on</p>
            <pre style={{overflow: 'auto', maxHeight: '120px'}}>
              <code>{JSON.stringify(event || params, null, 2)}</code>
            </pre>
          </>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around'
          }}
        >
          <button
            className="button button-green"
            onClick={authorizeHandler(
              true,
              {} // store this and answer true forever
            )}
          >
            authorize forever
          </button>
          {event?.kind !== undefined && (
            <button
              className="button button-green"
              onClick={authorizeHandler(
                true,
                {kinds: {[event.kind]: true}} // store and always answer true for all events that match this condition
              )}
            >
              authorize kind {event.kind} forever
            </button>
          )}
          <button className='button button-green' onClick={authorizeHandler(true)}>
            authorize just this
          </button>
          {event?.kind !== undefined ? (
            <button
             className='button'
              onClick={authorizeHandler(
                false,
                {kinds: {[event.kind]: true}} // idem
              )}
            >
              reject kind {event.kind} forever
            </button>
          ) : (
            <button
             className='button '
              onClick={authorizeHandler(
                false,
                {} // idem
              )}
            >
              reject forever
            </button>
          )}
          <button className='button' onClick={authorizeHandler(false)}>
            reject
          </button>
        </div>
      </div>
    </div>
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

render(<Prompt />, document.getElementById('main'))
