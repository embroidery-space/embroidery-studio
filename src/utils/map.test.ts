import { describe, it, expect } from "vitest";
import { ObjectedMap } from "./map";

describe("ObjectedMap", () => {
  it("should set and get a value by key", () => {
    const map = new ObjectedMap<object, string>();
    const key = { id: 1 };
    map.set(key, "value1");
    expect(map.get(key)).toBe("value1");
    expect(map.get({ id: 1 })).toBe("value1");
  });

  it("should return undefined for a non-existent key", () => {
    const map = new ObjectedMap<object, string>();
    const key = { id: 1 };
    expect(map.get(key)).toBeUndefined();
  });

  it("should delete a key-value pair by key", () => {
    const map = new ObjectedMap<object, string>();
    const key = { id: 1 };
    map.set(key, "value1");
    expect(map.delete(key)).toBe("value1");
    expect(map.get(key)).toBeUndefined();
    map.set(key, "value1");
    expect(map.delete({ id: 1 })).toBe("value1");
    expect(map.get({ id: 1 })).toBeUndefined();
  });

  it("should return undefined when deleting a non-existent key", () => {
    const map = new ObjectedMap<object, string>();
    const key = { id: 1 };
    expect(map.delete(key)).toBeUndefined();
  });

  it("should clear all entries", () => {
    const map = new ObjectedMap<object, string>();
    map.set({ id: 1 }, "value1");
    map.set({ id: 2 }, "value2");
    expect(map.size).toBe(2);
    map.clear();
    expect(map.size).toBe(0);
  });

  it("should extract all entries and clear the map", () => {
    const map = new ObjectedMap<object, string>();
    const key1 = { id: 1 };
    const key2 = { id: 2 };
    map.set(key1, "value1");
    map.set(key2, "value2");
    const entries = map.extract();
    expect(entries).toEqual([
      { key: key1, value: "value1" },
      { key: key2, value: "value2" },
    ]);
    expect(map.size).toBe(0);
  });
});
