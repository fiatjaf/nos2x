import { generatePrivateKey, nip19 } from 'nostr-tools'
import React, {useState} from 'react'
import {render} from 'react-dom'

function Signup() {
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')

  async function handleSignup(e) {
    setName(e.target.value)
  }

  function onSubmit(e) {
    e.preventDefault()
    // TODO: actions to create an account.
    // set name and about to their metadata and publish event...

    // setPrivKey(nip19.nsecEncode(generatePrivateKey()))
    // addUnsavedChanges('private_key')
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h1>Welcome!</h1>
        <form onSubmit={onSubmit}>
          <label>Share a bit about yourself:</label>
          <input
            onChange={handleSignup}
            value={name}
            placeholder="Enter your name..."
            type="text"
            required
            className="form-control"
          />

          <textarea
            onChange={e => setAbout(e.target.value)}
            value={about}
            placeholder="About you?"
            className="form-control"
          />

          <button type="submit" className="btn btn-primary">
            Generate keys
          </button>
        </form>
      </div>
    </div>
  )
}

render(<Signup />, document.getElementById('main'))
