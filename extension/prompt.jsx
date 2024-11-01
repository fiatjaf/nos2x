import browser, {i18n} from 'webextension-polyfill'
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
    <>
      <div>
        <b style={{display: 'block', textAlign: 'center', fontSize: '200%'}}>
          {host}
        </b>{' '}
        <p>
          {i18n.getMessage("requesting")}<b>{PERMISSION_NAMES[type]}:</b>
        </p>
      </div>
      {params && (
        <>
          <p>{i18n.getMessage("now_acting")}</p>
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
          style={{marginTop: '5px'}}
          onClick={authorizeHandler(
            true,
            {} // store this and answer true forever
          )}
        >
          {i18n.getMessage("auth_forever")}
        </button>
        {event?.kind !== undefined && (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              true,
              {kinds: {[event.kind]: true}} // store and always answer true for all events that match this condition
            )}
          >
            {i18n.getMessage("auth_kind_forever_prefix")}{event.kind}{i18n.getMessage("auth_kind_forever_suffix")}
          </button>
        )}
        <button style={{marginTop: '5px'}} onClick={authorizeHandler(true)}>
        {i18n.getMessage("auth_just")}
        </button>
        {event?.kind !== undefined ? (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              false,
              {kinds: {[event.kind]: true}} // idem
            )}
          >
            {i18n.getMessage("rej_kind_forever_prefix")}{event.kind}{i18n.getMessage("rej_kind_forever_suffix")}
          </button>
        ) : (
          <button
            style={{marginTop: '5px'}}
            onClick={authorizeHandler(
              false,
              {} // idem
            )}
          >
            {i18n.getMessage("rej_forever")}
          </button>
        )}
        <button style={{marginTop: '5px'}} onClick={authorizeHandler(false)}>
          {i18n.getMessage("reject")}
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

render(<Prompt />, document.getElementById('main'))
