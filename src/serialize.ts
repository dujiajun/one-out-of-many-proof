import { curve, zero } from "./params";
import { Exponent, GroupElement } from "./types";

const EMPTY: string =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function toBytes(x: Exponent): string {
  return "0x" + x.toString(16, 64);
}

export function representate(point: GroupElement): string {
  if (point.x == null && point.y == null) return EMPTY + EMPTY.slice(2);
  return toBytes(point.getX()) + toBytes(point.getY()).slice(2);
}

export function serialize(point: GroupElement): string[] {
  if (point.x == null && point.y == null) return [EMPTY, EMPTY];
  return [toBytes(point.getX()), toBytes(point.getY())];
}

export function deserialize(serialization: string[]) {
  if (serialization[0] == EMPTY && serialization[1] == EMPTY) return zero;
  return curve.point(serialization[0].slice(2), serialization[1].slice(2));
}
