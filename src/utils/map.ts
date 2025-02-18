import { dequal } from "dequal/lite";

const DEFAULT_BUCKETS_COUNT = 16;
const DEFAULT_LOAD_FACTOR = 0.75;

/** A custom map implementation that tuned to be efficient and to use objects as keys. */
export class ObjectedMap<K extends object, V> {
  #buckets: Array<Bucket<K, V>>;
  #loadFactor: number;
  #size = 0;

  constructor(bucketsCount = DEFAULT_BUCKETS_COUNT, loadFactor = DEFAULT_LOAD_FACTOR) {
    this.#buckets = Array.from({ length: bucketsCount }, () => []);
    this.#loadFactor = loadFactor;
  }

  /** The number of entries in the map. */
  get size(): number {
    return this.#size;
  }

  /** Set a key-value pair. */
  set(key: K, value: V): V {
    if (this.#size >= this.#buckets.length * this.#loadFactor) this.#resize();
    // In our case, the keys are always unique, so we don't need to check for duplicates.
    this.#buckets[this.#getBucketIndex(key)]!.push({ key, value });
    this.#size++;
    return value;
  }

  /** Get a value by key. */
  get(key: K): V | undefined {
    const bucket = this.#buckets[this.#getBucketIndex(key)]!;
    const existingIndex = this.#findEntry(bucket, key);
    return existingIndex >= 0 ? bucket[existingIndex]!.value : undefined;
  }

  /** Delete a key-value pair by key. */
  delete(key: K): V | undefined {
    const bucket = this.#buckets[this.#getBucketIndex(key)]!;
    const existingIndex = this.#findEntry(bucket, key);
    if (existingIndex >= 0) {
      this.#size--;
      return bucket.splice(existingIndex, 1)[0]?.value;
    } else return undefined;
  }

  /** Clear all entries in the map. */
  clear(): void {
    this.#buckets = Array.from({ length: this.#buckets.length }, () => []);
    this.#size = 0;
  }

  /** Get all entries in the map and clear it. */
  entries(): Bucket<K, V> {
    const entries: Bucket<K, V> = [];
    this.#buckets.forEach((bucket) => entries.push(...bucket));
    this.clear();
    return entries;
  }

  /** Get all keys in the map. */
  keys(): K[] {
    return this.entries().map((entry) => entry.key);
  }

  /** Get all values in the map. */
  values(): V[] {
    return this.entries().map((entry) => entry.value);
  }

  /** A simple hash function that implements the `djb2` algorithm. */
  #hash(key: K): number {
    const str = Object.values(key).toString();
    let hash = 5381;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    return hash >>> 0;
  }

  #getBucketIndex(key: K): number {
    return this.#hash(key) % this.#buckets.length;
  }

  #findEntry(bucket: Bucket<K, V>, key: K): number {
    return bucket.findIndex((entry) => dequal(entry.key, key));
  }

  #resize(): void {
    const oldBuckets = this.#buckets;
    this.#buckets = Array.from({ length: this.#buckets.length * 2 }, () => []);
    this.#size = 0;
    oldBuckets.flat().forEach(({ key, value }) => this.set(key, value));
  }

  static withCapacity<K extends object, V>(capacity: number): ObjectedMap<K, V> {
    capacity = capacity < DEFAULT_BUCKETS_COUNT ? DEFAULT_BUCKETS_COUNT : capacity;
    return new ObjectedMap(Math.ceil(capacity / DEFAULT_LOAD_FACTOR));
  }

  static withKeys<K extends object, V>(keys: K[]): ObjectedMap<K, V> {
    const map = ObjectedMap.withCapacity<K, V>(keys.length);
    for (const key of keys) map.set(key, undefined as V);
    return map;
  }
}

type Bucket<K, V> = Array<{ key: K; value: V }>;
