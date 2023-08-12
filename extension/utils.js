export class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize
    this.map = new Map()
    this.keys = []
  }

  clear() {
    this.map.clear()
  }

  has(k) {
    return this.map.has(k)
  }

  get(k) {
    const v = this.map.get(k)

    if (v !== undefined) {
      this.keys.push(k)

      if (this.keys.length > this.maxSize * 2) {
        this.keys.splice(-this.maxSize)
      }
    }

    return v
  }

  set(k, v) {
    this.map.set(k, v)
    this.keys.push(k)

    if (this.map.size > this.maxSize) {
      this.map.delete(this.keys.shift())
    }
  }
}
