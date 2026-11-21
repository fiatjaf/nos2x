export class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize
    this.map = new Map()
    this.keys = []
  }

  _zeroize(val) {
    if (val instanceof Uint8Array) {
      val.fill(0)
    }
  }

  clear() {
    for (const val of this.map.values()) {
      this._zeroize(val)
    }
    this.map.clear()
    this.keys = []
  }

  has(k) {
    return this.map.has(k)
  }

  get(k) {
    const v = this.map.get(k)

    if (v !== undefined) {
      const idx = this.keys.indexOf(k)
      if (idx !== -1) {
        this.keys.splice(idx, 1)
      }
      this.keys.push(k)
    }

    return v
  }

  set(k, v) {
    if (this.map.has(k)) {
      const existing = this.map.get(k)
      if (existing !== v) {
        this._zeroize(existing)
      }
      const idx = this.keys.indexOf(k)
      if (idx !== -1) {
        this.keys.splice(idx, 1)
      }
    }

    this.map.set(k, v)
    this.keys.push(k)

    while (this.map.size > this.maxSize && this.keys.length > 0) {
      const oldest = this.keys.shift()
      this._zeroize(this.map.get(oldest))
      this.map.delete(oldest)
    }
  }
}
