/* global BigInt */

import { utils, Point, CURVE } from '@noble/secp256k1'
import { hmac } from './hmac.js'

export async function getTweakedKey(prvkey, path) {
  if (typeof prvkey === 'string') {
    prvkey = utils.hexToBytes(prvkey)
  }
  const tweak = await hmac(path, prvkey)
  return privateTweak(prvkey, tweak)
}

function privateTweak(prvkey, tweak) {
  if (!(
    prvkey instanceof Uint8Array &&
    tweak instanceof Uint8Array
  )) { throw new Error('Invalid input!') }

  const keynum = bytesToBig(prvkey)
  const twknum = utils.mod(bytesToBig(tweak), CURVE.n)

  let newnum = utils.mod(keynum + twknum, CURVE.n)

  if (hasOddY(newnum)) {
    // If key has an odd Y value,
    // perform negate operation.
    newnum = CURVE.n - newnum
  }

  if (!isValidKey(newnum)) {
    const increment = bigToBytes(newnum + 1n)
    return privateTweak(increment, tweak)
  }

  return bigToBytes(newnum)
}

function hasOddY(num) {
  const prvkey = bigToBytes(num)
  return !Point.fromPrivateKey(prvkey).hasEvenY()
}

function isValidKey(num) {
  const prvkey = bigToBytes(num)
  return utils.isValidPrivateKey(prvkey)
}

export function bytesToBig (bytes, rev = true) {
  if (rev) bytes.reverse()
  let num = 0n, i
  for (i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256n) + BigInt(bytes[i])
  }
  return BigInt(num)
}

export function bigToBytes (big, rev = true) {
  const bytes = []
  while (big > 0n) {
    const byte = big & 0xffn
    bytes.push(Number(byte))
    big = (big - byte) / 256n
  }
  if (rev) bytes.reverse()
  return Uint8Array.from(bytes)
}
