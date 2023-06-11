import browser from 'webextension-polyfill'

export const NO_PERMISSIONS_REQUIRED = {
  replaceURL: true
}

export const PERMISSION_NAMES = Object.fromEntries([
  ['getPublicKey', 'read your public key'],
  ['getRelays', 'read your list of preferred relays'],
  ['signEvent', 'sign events using your private key'],
  ['nip04.encrypt', 'encrypt messages to peers'],
  ['nip04.decrypt', 'decrypt messages from peers']
])

function matchConditions(conditions, event) {
  if (conditions?.kinds) {
    if (event.kind in conditions.kinds) return true
    else return false
  }

  return true
}

export async function getPermissionStatus(host, type, event) {
  let {policies} = await browser.storage.local.get('policies')

  let answers = [true, false]
  for (let i = 0; i < answers.length; i++) {
    let accept = answers[i]
    let {conditions} = policies?.[host]?.[accept]?.[type] || {}

    if (conditions) {
      if (type === 'signEvent') {
        if (matchConditions(conditions, event)) {
          return accept // may be true or false
        } else {
          // if this doesn't match we just continue so it will either match for the opposite answer (reject)
          // or it will end up returning undefined at the end
          continue
        }
      } else {
        return accept // may be true or false
      }
    }
  }

  return undefined
}

export async function updatePermission(host, type, accept, conditions) {
  let {policies = {}} = await browser.storage.local.get('policies')

  // if the new conditions is "match everything", override the previous
  if (Object.keys(conditions).length === 0) {
    conditions = {}
  } else {
    // if we already had a policy for this, merge the conditions
    let existingConditions = policies[host]?.[accept]?.[type]?.conditions
    if (existingConditions) {
      if (existingConditions.kinds && conditions.kinds) {
        Object.keys(existingConditions.kinds).forEach(kind => {
          conditions.kinds[kind] = true
        })
      }
    }
  }

  // if we have a reverse policy (accept / reject) that is exactly equal to this, remove it
  let other = !accept
  let reverse = policies?.[host]?.[other]?.[type]
  if (
    reverse &&
    JSON.stringify(reverse.conditions) === JSON.stringify(conditions)
  ) {
    delete policies[host][other][type]
  }

  // insert our new policy
  policies[host] = policies[host] || {}
  policies[host][accept] = policies[host][accept] || {}
  policies[host][accept][type] = {
    conditions, // filter that must match the event (in case of signEvent)
    created_at: Math.round(Date.now() / 1000)
  }

  browser.storage.local.set({policies})
}

export async function removePermissions(host, accept, type) {
  let {policies = {}} = await browser.storage.local.get('policies')
  delete policies[host]?.[accept]?.[type]
  browser.storage.local.set({policies})
}

export async function showNotification(host, answer, type, params) {
  let ok = await browser.storage.local.get('notifications')
  if (ok) {
    let action = answer ? 'allowed' : 'denied'
    browser.notifications.create(undefined, {
      type: 'basic',
      title: `${type} ${action} for ${host}`,
      message: JSON.stringify(
        params?.event
          ? {
              kind: params.event.kind,
              content: params.event.content,
              tags: params.event.tags
            }
          : params,
        null,
        2
      ),
      iconUrl: 'icons/48x48.png'
    })
  }
}
