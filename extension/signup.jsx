import React from 'react'
import {render} from 'react-dom'
// TODO:
// generate nostr keypair plus setting up metadata ?!!

function Signup() {
  return (
    <>
      <div className="modal">
        <div className="modal-content">
          
            <h1>Welcome</h1>
            <div className='text'>After creating your account, you are ready to explore your first Nostr websites.</div>
            <form>
              <label>Share a bit about yourself:</label>
              <input
                placeholder="Enter your name..."
                type="text"
                required
                className="form-control"
              />
          

            
              <textarea placeholder="Who are you?" className="form-control" />
         

            <button type="submit" class="btn btn-primary">
              Generate Nostr Keys
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

render(<Signup />, document.getElementById('main'))
