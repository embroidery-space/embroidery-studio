import { dequal } from "dequal/lite";

/** A simple map implementation that tuned to use objects as keys. */
export class ObjectedMap<K, V> {
  #entries: { key: K; value: V }[] = [];

  /** The number of entries in the map. */
  get size(): number {
    return this.#entries.length;
  }

  /** Set a key-value pair. */
  set(key: K, value: V): V {
    // In our case the keys are always unique, so we don't need to check for duplicates.
    this.#entries.push({ key, value });
    return value;
  }

  /** Get a value by key. */
  get(key: K): V | undefined {
    const entry = this.#entries.find((entry) => dequal(entry.key, key));
    return entry?.value;
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

  /** Extract all entries from the map. */
  extract() {
    const entries = this.#entries;
    this.clear();
    return entries;
  }
}
