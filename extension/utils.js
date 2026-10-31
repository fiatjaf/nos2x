export class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize
    // insertion order doubles as recency order: re-inserting on get()
    // keeps the oldest-used entry at the front for eviction
    this.map = new Map()
  }

  clear() {
    this.map.clear()
  }

  has(k) {
    return this.map.has(k)
  }

  get(k) {
    if (!this.map.has(k)) return undefined

    const v = this.map.get(k)
    // re-insert to mark this key as the most recently used
    this.map.delete(k)
    this.map.set(k, v)

    return v
  }

  set(k, v) {
    if (this.map.has(k)) this.map.delete(k)
    this.map.set(k, v)

    if (this.map.size > this.maxSize) {
      // evict the least recently used entry (front of insertion order)
      this.map.delete(this.map.keys().next().value)
    }
  }
}
