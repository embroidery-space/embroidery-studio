import { dequal } from "dequal/lite";

/** A simple map implementation that tuned to use objects as keys. */
export class ObjectedMap<K, V> {
  #entries: { key: K; value: V }[] = [];

  /** The number of entries in the map. */
  get size(): number {
    return this.#entries.length;
  }

  /** Set a key-value pair. */
  set(key: K, value: V): this {
    const existingEntry = this.#entries.find((entry) => dequal(entry.key, key));
    if (existingEntry) existingEntry.value = value;
    else this.#entries.push({ key, value });
    return this;
  }

  /** Get a value by key. */
  get(key: K): V | undefined {
    const entry = this.#entries.find((entry) => dequal(entry.key, key));
    return entry ? entry.value : undefined;
  }

  /** Check if a key exists in the map. */
  has(key: K): boolean {
    return this.#entries.some((entry) => dequal(entry.key, key));
  }

  /** Delete a key-value pair by key. */
  delete(key: K): V | undefined {
    const index = this.#entries.findIndex((entry) => dequal(entry.key, key));
    return index !== -1 ? this.#entries.splice(index, 1)[0]?.value : undefined;
  }

  /** Clear all entries in the map. */
  clear(): void {
    this.#entries = [];
  }

  /** Iterate over keys. */
  *keys(): IterableIterator<K> {
    for (const { key } of this.#entries) yield key;
  }

  /** Iterate over values/ */
  *values(): IterableIterator<V> {
    for (const { value } of this.#entries) yield value;
  }

  /** Iterate over entries. */
  *entries(): IterableIterator<[K, V]> {
    for (const { key, value } of this.#entries) yield [key, value];
  }
}
