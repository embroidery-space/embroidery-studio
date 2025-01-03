import { BinaryReader, BinaryWriter, deserialize, deserializeStruct, field, serialize } from "@dao-xyz/borsh";
import { PatternProject } from "../project";
import { FullStitch, LineStitch, NodeStitch, PartStitch, type Stitch } from "../pattern";

class PatternKey {
  @field({ type: "string" })
  key: string;

  constructor(data: PatternKey) {
    this.key = data.key;
  }
}

export function deserializePatternProject(buffer: Uint8Array) {
  const patternKey = deserialize(buffer, PatternKey, { unchecked: true });
  const patproj = deserialize(buffer.slice(serialize(patternKey).length), PatternProject);
  patproj.key = patternKey.key;
  return patproj;
}

// TODO: remove custom stitches de/serialization functions.
// They are a temporary workaround because `borsh-ts` can't deal with enums.
export function deserializeStitches(buffer: Uint8Array) {
  const stitches = [];
  const reader = new BinaryReader(buffer);
  const length = reader.u32();
  for (let i = 0; i < length; i++) {
    const variant = reader.u8();
    if (variant === 0) stitches.push(deserializeStruct(FullStitch, false)(reader, { unchecked: true }));
    else if (variant === 1) stitches.push(deserializeStruct(PartStitch, false)(reader, { unchecked: true }));
    else if (variant === 2) stitches.push(deserializeStruct(LineStitch, false)(reader, { unchecked: true }));
    else stitches.push(deserializeStruct(NodeStitch, false)(reader, { unchecked: true }));
  }
  return stitches;
}

export function deserializeStitch(buffer: Uint8Array) {
  const reader = new BinaryReader(buffer);
  const variant = reader.u8();
  if (variant === 0) return deserializeStruct(FullStitch, false)(reader);
  else if (variant === 1) return deserializeStruct(PartStitch, false)(reader);
  else if (variant === 2) return deserializeStruct(LineStitch, false)(reader);
  else return deserializeStruct(NodeStitch, false)(reader);
}

export function serializeStitch(stitch: Stitch) {
  const writer = new BinaryWriter();
  if (stitch instanceof FullStitch) writer.u8(0);
  else if (stitch instanceof PartStitch) writer.u8(1);
  else if (stitch instanceof LineStitch) writer.u8(2);
  else writer.u8(3);
  serialize(stitch, writer);
  return writer.finalize();
}
