/* global BigInt */

import { utils, Point, CURVE } from '@noble/secp256k1'
import { hmac } from './hmac.js'

export async function getTweakedKey(prvkey, path) {
  const tweak = await hmac(path, prvkey)
  return privateTweak(prvkey, tweak)
}

function privateTweak(prvkey, tweak) {
  if (!(
    prvkey instanceof Uint8Array &&
    tweak instanceof Uint8Array
  )) { throw new Error('Invalid input!') }

  const keynum = bytesToBig(prvkey)
  const twknum = bytesToBig(tweak)

  let newnum = utils.mod(keynum * twknum, CURVE.n)

  if (hasOddY(newnum)) {
    // If key has an odd Y value,
    // perform negate operation.
    newnum = CURVE.n - newnum
  }

  if (!utils.isValidPrivateKey(newnum)) {
    const increment = bigToBytes(newnum + 1n)
    return bigToBytes(increment, tweak)
  }

  return bigToBytes(newnum)
}

function hasOddY(prvkey) {
  return !Point.fromPrivateKey(prvkey).hasEvenY
}

function bytesToBig (bytes) {
  let num = 0n, i
  for (i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256n) + BigInt(bytes[i])
  }
  return BigInt(num)
}

function bigToBytes (big) {
  const bytes = []
  while (big > 0n) {
    const byte = big & 0xffn
    bytes.push(Number(byte))
    big = (big - byte) / 256n
  }
  return Uint8Array.from(bytes)
}
