import { deserialize, field, serialize } from "@dao-xyz/borsh";
import { PatternProject } from "./project";

export * from "./project";
export * from "./pattern";
export * from "./display";
export * from "./print";

class PatternKey {
  @field({ type: "string" })
  key: string;

  constructor(data: PatternKey) {
    this.key = data.key;
  }
}

export function deserializePatternProject(buffer: Uint8Array) {
  const patternKey = deserialize(buffer, PatternKey, { unchecked: true });
  const patproj = deserialize(buffer.slice(serialize(patternKey).length), PatternProject, { object: true });
  patproj.key = patternKey.key;
  return patproj;
}
